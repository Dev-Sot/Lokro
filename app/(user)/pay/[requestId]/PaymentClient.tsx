'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, AlertCircle, RefreshCw, CreditCard, Building2, Landmark, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  requestId: string
  amount: number
}

const PAYMENT_METHODS = [
  { icon: CreditCard,  label: 'Tarjeta crédito/débito' },
  { icon: Building2,   label: 'PSE' },
  { icon: Landmark,    label: 'Bancolombia' },
  { icon: Banknote,    label: 'Efecty / Baloto' },
]

export function PaymentClient({ requestId, amount }: Props) {
  const [initPoint, setInitPoint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  function fetchPreference() {
    setLoading(true)
    setError(null)
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
  }

  useEffect(() => {
    fetchPreference()
  }, [requestId, amount])

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <p className="font-semibold text-destructive">Error al preparar el pago</p>
            <p className="text-destructive/80 mt-1">{error}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2" onClick={fetchPreference}>
          <RefreshCw size={15} />
          Reintentar
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-[#009EE3]/10 flex items-center justify-center">
            <svg width="32" height="20" viewBox="0 0 80 50" fill="none" className="opacity-80">
              <rect width="80" height="50" rx="8" fill="#009EE3"/>
              <circle cx="30" cy="25" r="14" fill="#FFE600" fillOpacity="0.9"/>
              <circle cx="50" cy="25" r="14" fill="white" fillOpacity="0.8"/>
            </svg>
          </div>
          <Loader2 size={18} className="animate-spin text-[#009EE3] absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Conectando con Mercado Pago…</p>
          <p className="text-xs text-muted-foreground mt-0.5">Preparando tu enlace de pago seguro</p>
        </div>
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
        className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 px-6 font-semibold text-white transition-all active:scale-[0.98] hover:opacity-95 shadow-lg shadow-[#009EE3]/30"
        style={{ background: 'linear-gradient(135deg, #009EE3 0%, #0077b6 100%)' }}
      >
        {/* MP Logo mark */}
        <svg width="26" height="26" viewBox="0 0 80 50" fill="none">
          <rect width="80" height="50" rx="8" fill="white" fillOpacity="0.15"/>
          <circle cx="30" cy="25" r="13" fill="#FFE600" fillOpacity="0.9"/>
          <circle cx="50" cy="25" r="13" fill="white" fillOpacity="0.85"/>
        </svg>
        Pagar con Mercado Pago
        <ExternalLink size={15} className="opacity-70" />
      </a>

      {/* Payment methods grid */}
      <div className="rounded-2xl border bg-muted/20 p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wide">
          Medios de pago aceptados
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl bg-background border px-3 py-2 text-xs text-muted-foreground"
            >
              <Icon size={14} className="shrink-0 text-foreground/60" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
        Serás redirigido al sitio seguro de Mercado Pago.<br />
        Tu información está protegida con cifrado SSL.
      </p>
    </div>
  )
}
