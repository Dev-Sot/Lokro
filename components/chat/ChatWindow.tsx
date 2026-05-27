'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, Loader2, Navigation, CheckCircle2, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ReviewForm } from '@/components/requests/ReviewForm'
import { createClient } from '@/lib/supabase/client'
import { messageSchema, type MessageInput } from '@/lib/validations/service'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { Message, ServiceRequest, User } from '@/types'

interface ChatWindowProps {
  request: ServiceRequest
  currentUser: User
  otherUser: User
  isProvider: boolean
}

export function ChatWindow({ request, currentUser, otherUser, isProvider }: ChatWindowProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [status, setStatus] = useState(request.status)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  async function updateStatus(newStatus: 'IN_PROGRESS' | 'COMPLETED') {
    setUpdatingStatus(true)
    const { error } = await supabase
      .from('service_requests')
      .update({ status: newStatus })
      .eq('id', request.id)

    if (error) {
      toast.error('Error al actualizar el estado')
    } else {
      await supabase.from('service_status_history').insert({
        request_id: request.id,
        status: newStatus,
        created_by: currentUser.id,
      })
      setStatus(newStatus)
      toast.success(newStatus === 'IN_PROGRESS' ? '¡En camino!' : '¡Servicio completado!')
      if (newStatus === 'IN_PROGRESS') router.refresh()
    }
    setUpdatingStatus(false)
  }

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MessageInput>({
    resolver: zodResolver(messageSchema),
  })

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:users(id, name, avatar_url)')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true })

      setMessages((data ?? []) as unknown as Message[])

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('request_id', request.id)
        .neq('sender_id', currentUser.id)
        .eq('read', false)
    }

    loadMessages()

    const channel = supabase
      .channel(`chat:${request.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${request.id}`,
      }, async (payload) => {
        const newMsg = payload.new as Message
        const { data: sender } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .eq('id', newMsg.sender_id)
          .single()

        setMessages((prev) => [...prev, { ...newMsg, sender: sender ?? undefined } as Message])
        setTyping(false)

        if (newMsg.sender_id !== currentUser.id) {
          await supabase.from('messages').update({ read: true }).eq('id', newMsg.id)
        }
      })
      .on('broadcast', { event: 'typing' }, () => {
        setTyping(true)
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => setTyping(false), 3000)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [request.id, currentUser.id])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  async function broadcastTyping() {
    await supabase.channel(`chat:${request.id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUser.id },
    })
  }

  async function onSubmit(data: MessageInput) {
    await supabase.from('messages').insert({
      request_id: request.id,
      sender_id: currentUser.id,
      content: data.content,
      read: false,
    })
    reset()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b shrink-0 flex-wrap">
        <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatar_url} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{otherUser.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {(request.category as { name?: string })?.name ?? 'Servicio'}
          </p>
        </div>
        <StatusBadge status={status} />

        <Link
          href={`/tracking/${request.id}`}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <MapPin size={12} />
          Tracking
        </Link>

        {!isProvider && status === 'ACCEPTED' && (
          <Button size="sm" className="gap-1.5" asChild>
            <Link href={`/pay/${request.id}`}>
              <CreditCard size={12} />
              Pagar
            </Link>
          </Button>
        )}
        {isProvider && status === 'ACCEPTED' && (
          <Button
            size="sm"
            variant="outline"
            disabled={updatingStatus}
            onClick={() => updateStatus('IN_PROGRESS')}
            className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            {updatingStatus ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
            En camino
          </Button>
        )}
        {isProvider && status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            disabled={updatingStatus}
            onClick={() => updateStatus('COMPLETED')}
            className="gap-1.5"
          >
            {updatingStatus ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Completado
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUser.id
          const sender = msg.sender as { name: string; avatar_url: string | null } | undefined
          return (
            <div key={msg.id} className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}>
              {!isOwn && (
                <UserAvatar
                  name={sender?.name ?? '?'}
                  avatarUrl={sender?.avatar_url}
                  size="sm"
                  className="shrink-0"
                />
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={cn('text-[10px] mt-1', isOwn ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground')}>
                  {formatRelativeTime(msg.created_at)}
                  {isOwn && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                </p>
              </div>
            </div>
          )
        })}

        {typing && (
          <div className="flex items-end gap-2">
            <UserAvatar name={otherUser.name} avatarUrl={otherUser.avatar_url} size="sm" />
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Review form — shown when service is COMPLETED and review not yet submitted */}
      {status === 'COMPLETED' && !reviewDone && (
        <div className="p-4 border-t bg-muted/30">
          <ReviewForm
            requestId={request.id}
            authorId={currentUser.id}
            targetId={otherUser.id}
            type={isProvider ? 'TO_USER' : 'TO_PROVIDER'}
            targetName={otherUser.name}
            onComplete={() => setReviewDone(true)}
          />
        </div>
      )}

      {/* Message input — disabled when COMPLETED */}
      {status !== 'COMPLETED' && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex gap-2 p-4 border-t shrink-0"
        >
          <Input
            placeholder="Escribe un mensaje..."
            className="flex-1"
            {...register('content')}
            onKeyDown={broadcastTyping}
          />
          <Button type="submit" size="icon" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      )}
    </div>
  )
}