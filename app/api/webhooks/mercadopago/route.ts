import { NextResponse } from 'next/server'
import { Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { mpClient } = await import('@/lib/mercadopago')

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Mercado Pago sends { type: 'payment', data: { id: '...' } }
  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ received: true })
  }

  const paymentClient = new Payment(mpClient)
  let paymentData: Awaited<ReturnType<typeof paymentClient.get>>
  try {
    paymentData = await paymentClient.get({ id: body.data.id })
  } catch {
    return NextResponse.json({ error: 'Could not fetch payment' }, { status: 400 })
  }

  const requestId = paymentData.external_reference
  if (!requestId) return NextResponse.json({ received: true })

  const supabase = await createAdminClient()

  if (paymentData.status === 'approved') {
    await supabase
      .from('payments')
      .update({ status: 'PAID' })
      .eq('request_id', requestId)

    await supabase
      .from('service_requests')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', requestId)

    const { data: serviceReq } = await supabase
      .from('service_requests')
      .select('provider_id, user_id')
      .eq('id', requestId)
      .single()

    if (serviceReq) {
      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('user_id')
        .eq('id', serviceReq.provider_id)
        .single()

      if (providerProfile) {
        await supabase.from('notifications').insert({
          user_id: providerProfile.user_id,
          type: 'PAYMENT_RECEIVED',
          title: 'Pago recibido',
          message: 'Has recibido el pago por tu servicio. El trabajo puede comenzar.',
          read: false,
        })
      }

      await supabase.from('notifications').insert({
        user_id: serviceReq.user_id,
        type: 'PROVIDER_EN_ROUTE',
        title: 'Prestador en camino',
        message: 'Tu pago fue confirmado. El prestador está en camino.',
        read: false,
      })
    }
  } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
    await supabase
      .from('payments')
      .update({ status: 'REFUNDED' })
      .eq('request_id', requestId)
  }

  return NextResponse.json({ received: true })
}