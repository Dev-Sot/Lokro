import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PaymentClient } from './PaymentClient'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Pagar servicio' }

interface Props {
  params: Promise<{ requestId: string }>
}

export default async function PayPage({ params }: Props) {
  const { requestId } = await params
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

  const amount = request.estimated_price ?? (request.provider as any)?.hourly_rate ?? 5000

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pagar servicio</h1>
          <p className="text-muted-foreground mt-1">Pago seguro procesado por Mercado Pago</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Servicio</span>
            <span className="font-medium">
              {(request.category as any)?.icon} {(request.category as any)?.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prestador</span>
            <span className="font-medium">{(request.provider as any)?.user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comisión plataforma (10%)</span>
            <span>{formatCurrency(amount * 0.1)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary text-lg">{formatCurrency(amount)}</span>
          </div>
        </div>

        <PaymentClient requestId={requestId} amount={amount} />
      </div>
    </div>
  )
}