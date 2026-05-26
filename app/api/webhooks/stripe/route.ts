import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { stripe } = await import('@/lib/stripe')
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      const requestId = intent.metadata.requestId

      await supabase
        .from('payments')
        .update({ status: 'PAID' })
        .eq('stripe_payment_intent', intent.id)

      await supabase
        .from('service_requests')
        .update({ status: 'IN_PROGRESS' })
        .eq('id', requestId)

      // Get provider user_id for notification
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
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('payments')
        .update({ status: 'REFUNDED' })
        .eq('stripe_payment_intent', intent.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
