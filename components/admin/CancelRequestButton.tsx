'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { cancelRequest } from '@/app/actions/admin'

interface Props {
  requestId: string
}

export function CancelRequestButton({ requestId }: Props) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('¿Cancelar esta solicitud? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      try {
        await cancelRequest(requestId)
        toast.success('Solicitud cancelada')
      } catch {
        toast.error('Error al cancelar la solicitud')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="h-7 px-2 rounded-md border border-destructive/40 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
    >
      <X size={11} />
      Cancelar
    </button>
  )
}
