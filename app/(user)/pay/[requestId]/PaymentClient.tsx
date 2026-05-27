'use client'

import { useState, useEffect } from 'react'
import { Loader2, Lock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  requestId: string
  amount: number
}

export function PaymentClient({ requestId, amount }: Props) {
  const [initPoint, setInitPoint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, amount }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setInitPoint(data.initPoint)
      })
      .catch(() => setError('Error al iniciar el pago'))
      .finally(() => setLoading(false))
  }, [requestId, amount])

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!initPoint) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        No se pudo obtener el enlace de pago. Recarga la página e intenta de nuevo.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        size="lg"
        className="w-full gap-2 bg-[#009EE3] hover:bg-[#0082be] text-white"
        asChild
      >
        <a href={initPoint}>
          <CreditCard size={18} />
          Pagar con Mercado Pago
        </a>
      </Button>

      <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground">
        <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
          <Lock size={13} /> Pago 100% seguro
        </p>
        <p>Serás redirigido a Mercado Pago para completar el pago de forma segura.</p>
        <p>Aceptamos tarjetas de crédito, débito, PSE y efectivo (Efecty, Baloto).</p>
      </div>
    </div>
  )
}