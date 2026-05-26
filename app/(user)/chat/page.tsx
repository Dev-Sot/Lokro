import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatRelativeTime } from '@/lib/utils'
import type { ServiceRequestStatus } from '@/types'

export const metadata: Metadata = { title: 'Mensajes' }

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  const isProvider = userRow?.role === 'PROVIDER'

  let query = supabase
    .from('service_requests')
    .select(`
      id, status, description, created_at,
      user:users!service_requests_user_id_fkey(name, avatar_url),
      provider:provider_profiles!service_requests_provider_id_fkey(
        user:users(name, avatar_url)
      ),
      category:categories(name, icon),
      messages:messages(content, created_at, read, sender_id)
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  if (isProvider) {
    const { data: profile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', authUser.id)
      .single()

    if (profile) {
      query = query.eq('provider_id', profile.id) as typeof query
    }
  } else {
    query = query.eq('user_id', authUser.id) as typeof query
  }

  const { data: requests } = await query

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mensajes</h1>

      {!requests || requests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin conversaciones</p>
          <p className="text-sm">Tus conversaciones aparecerán aquí cuando tengas solicitudes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => {
            const requestUser = req.user as unknown as { name: string; avatar_url: string | null } | null
            const providerUser = (req.provider as unknown as { user: { name: string; avatar_url: string | null } } | null)?.user
            const otherUser = isProvider ? requestUser : providerUser
            const category = req.category as unknown as { name: string; icon: string } | null
            const msgs = req.messages as unknown as { content: string; created_at: string; read: boolean; sender_id: string }[]
            const lastMsg = msgs?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            const unread = msgs?.filter((m) => !m.read && m.sender_id !== authUser.id).length ?? 0

            return (
              <Link
                key={req.id}
                href={`/chat/${req.id}`}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <UserAvatar
                  name={otherUser?.name ?? '?'}
                  avatarUrl={otherUser?.avatar_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{otherUser?.name}</p>
                    {lastMsg && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelativeTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {category?.icon} {category?.name}
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {lastMsg.content}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={req.status as ServiceRequestStatus} />
                  {unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
