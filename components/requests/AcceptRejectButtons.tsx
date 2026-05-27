'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface AcceptRejectButtonsProps {
  requestId: string
  clientUserId: string
  providerUserId: string
  providerName: string
}

export function AcceptRejectButtons({
  requestId,
  clientUserId,
  providerUserId,
  providerName,
}: AcceptRejectButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)
  const supabase = createClient()

  async function handleAccept() {
    setLoading('accept')
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'ACCEPTED' })
      .eq('id', requestId)

    if (error) {
      toast.error('Error al aceptar la solicitud')
      setLoading(null)
      return
    }

    await supabase.from('service_status_history').insert({
      request_id: requestId,
      status: 'ACCEPTED',
      created_by: providerUserId,
    })

    await supabase.from('notifications').insert({
      user_id: clientUserId,
      title: '✅ Solicitud aceptada',
      message: `${providerName} aceptó tu solicitud. ¡Ya puedes coordinar los detalles!`,
      type: 'REQUEST_ACCEPTED',
      read: false,
    })

    fetch('/api/email/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'REQUEST_ACCEPTED', requestId }),
    }).catch(() => {})

    toast.success('Solicitud aceptada')
    router.refresh()
    setLoading(null)
  }

  async function handleReject() {
    setLoading('reject')
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'CANCELLED' })
      .eq('id', requestId)

    if (error) {
      toast.error('Error al rechazar la solicitud')
      setLoading(null)
      return
    }

    await supabase.from('service_status_history').insert({
      request_id: requestId,
      status: 'CANCELLED',
      created_by: providerUserId,
    })

    await supabase.from('notifications').insert({
      user_id: clientUserId,
      title: '❌ Solicitud rechazada',
      message: `${providerName} no pudo aceptar tu solicitud en este momento.`,
      type: 'REQUEST_CANCELLED',
      read: false,
    })

    toast.success('Solicitud rechazada')
    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex gap-2 w-full">
      <Button
        size="sm"
        variant="outline"
        className="flex-1 gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
        disabled={loading !== null}
        onClick={handleReject}
      >
        {loading === 'reject'
          ? <Loader2 size={13} className="animate-spin" />
          : <XCircle size={13} />}
        Rechazar
      </Button>
      <Button
        size="sm"
        className="flex-1 gap-1.5"
        disabled={loading !== null}
        onClick={handleAccept}
      >
        {loading === 'accept'
          ? <Loader2 size={13} className="animate-spin" />
          : <CheckCircle2 size={13} />}
        Aceptar
      </Button>
    </div>
  )
}
