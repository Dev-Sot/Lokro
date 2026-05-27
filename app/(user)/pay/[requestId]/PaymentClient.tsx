'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react'

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
      .catch(() => setError('No se pudo conectar con el servidor de pagos'))
      .finally(() => setLoading(false))
  }, [requestId, amount])

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-destructive">Error al preparar el pago</p>
          <p className="text-destructive/80 mt-0.5">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#009EE3]" />
        <p className="text-sm text-muted-foreground">Preparando pasarela de pago…</p>
      </div>
    )
  }

  if (!initPoint) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        No se pudo obtener el enlace de pago. Recarga la página.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main CTA */}
      <a
        href={initPoint}
        className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 px-6 font-semibold text-white transition-all active:scale-[0.98] shadow-lg shadow-[#009EE3]/25"
        style={{ background: 'linear-gradient(135deg, #009EE3 0%, #0082be 100%)' }}
      >
        {/* MP Logo */}
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="white" fillOpacity="0.2"/>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">$</text>
        </svg>
        Pagar con Mercado Pago
        <ExternalLink size={16} className="opacity-70" />
      </a>

      {/* Methods */}
      <div className="rounded-2xl border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 text-center">Medios de pago aceptados</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {[
            { emoji: '💳', label: 'Tarjeta de crédito' },
            { emoji: '🏦', label: 'Tarjeta débito' },
            { emoji: '🏧', label: 'PSE' },
            { emoji: '💵', label: 'Efecty / Baloto' },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Serás redirigido al sitio seguro de Mercado Pago. Tu información está protegida.
      </p>
    </div>
  )
}
