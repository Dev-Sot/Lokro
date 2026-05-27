import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Clock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { PaymentClient } from './PaymentClient'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Pagar servicio' }

interface Props {
  params: Promise<{ requestId: string }>
  searchParams: Promise<{ payment?: string }>
}

export default async function PayPage({ params, searchParams }: Props) {
  const { requestId } = await params
  const { payment } = await searchParams
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: request } = await supabase
    .from('service_requests')
    .select(`
      id, status, description, estimated_price,
      user_id,
      provider:provider_profiles(
        hourly_rate,
        user:users(name, avatar_url)
      ),
      category:categories(name, icon)
    `)
    .eq('id', requestId)
    .single()

  if (!request) notFound()
  if (request.user_id !== authUser.id) redirect('/home')
  if (request.status !== 'ACCEPTED') redirect(`/chat/${requestId}`)

  const provider = request.provider as any
  const category = request.category as any
  const amount = request.estimated_price ?? provider?.hourly_rate ?? 5000
  const fee = Math.round(amount * 0.1)
  const providerAmount = amount - fee

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Back */}
        <Link
          href={`/chat/${requestId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al chat
        </Link>

        {/* Failed payment alert */}
        {payment === 'failed' && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            El pago no pudo completarse. Por favor intenta de nuevo.
          </div>
        )}

        <div className="space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Confirmar pago</h1>
            <p className="text-muted-foreground mt-1 text-sm">Serás redirigido a Mercado Pago para completar el pago</p>
          </div>

          {/* Provider card */}
          <div className="rounded-2xl border bg-card p-5 flex items-center gap-4 shadow-sm">
            <UserAvatar
              name={provider?.user?.name ?? '?'}
              avatarUrl={provider?.user?.avatar_url}
              size="lg"
            />
            <div>
              <p className="font-semibold">{provider?.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {category?.icon} {category?.name}
              </p>
              {request.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{request.description}</p>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b bg-muted/30">
              <p className="font-semibold text-sm">Resumen del pago</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servicio</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comisión plataforma (10%)</span>
                <span className="text-muted-foreground">{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pago al prestador</span>
                <span className="text-green-600 font-medium">{formatCurrency(providerAmount)}</span>
              </div>
              <div className="pt-3 border-t flex justify-between">
                <span className="font-bold">Total a pagar</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment button */}
          <PaymentClient requestId={requestId} amount={amount} />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Shield, label: 'Pago seguro', sub: 'Mercado Pago' },
              { icon: Clock, label: 'Instantáneo', sub: 'Confirmación inmediata' },
              { icon: CheckCircle2, label: 'Garantizado', sub: 'Protección al comprador' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-xl border bg-card p-3 text-center space-y-1">
                <Icon size={18} className="mx-auto text-primary" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
