
import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import { Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentReceivedEmail } from '@/lib/services/email'

export const dynamic = 'force-dynamic'

function verifyMPSignature(req: Request, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // allow in dev without secret configured

  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id') ?? ''
  if (!xSignature) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  let dataId: string
  try {
    dataId = JSON.parse(rawBody).data?.id
  } catch {
    return false
  }

  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hash = createHmac('sha256', secret).update(template).digest('hex')
  return hash === v1
}

export async function POST(request: Request) {
  const { mpClient } = await import('@/lib/mercadopago')

  const rawBody = await request.text()
  if (!verifyMPSignature(request, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = (() => { try { return JSON.parse(rawBody) } catch { return null } })()
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
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({ status: 'PAID' })
      .eq('request_id', requestId)

    if (paymentUpdateError) {
      console.error('Webhook: failed to update payment status', paymentUpdateError)
      return NextResponse.json({ error: 'Payment update failed' }, { status: 500 })
    }

    const { error: requestUpdateError } = await supabase
      .from('service_requests')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', requestId)

    if (requestUpdateError) {
      console.error('Webhook: failed to update request status', requestUpdateError)
      return NextResponse.json({ error: 'Request update failed' }, { status: 500 })
    }

    const { data: serviceReq } = await supabase
      .from('service_requests')
      .select('provider_id, user_id')
      .eq('id', requestId)
      .single()

    if (serviceReq) {
      const { data: providerProfile } = await supabase
        .from('provider_profiles')
        .select('user_id, user:users(name, email)')
        .eq('id', serviceReq.provider_id)
        .single()

      if (providerProfile) {
        const { error: provNotifError } = await supabase.from('notifications').insert({
          user_id: providerProfile.user_id,
          type: 'PAYMENT_RECEIVED',
          title: 'Pago recibido',
          message: 'Has recibido el pago por tu servicio. El trabajo puede comenzar.',
          read: false,
        })
        if (provNotifError) console.error('Webhook: provider notification failed', provNotifError)

        const { data: clientUser } = await supabase
          .from('users')
          .select('name')
          .eq('id', serviceReq.user_id)
          .single()

        const provUser = Array.isArray(providerProfile.user)
          ? null
          : providerProfile.user as unknown as { name: string; email: string } | null
        if (provUser?.email) {
          sendPaymentReceivedEmail({
            toEmail: provUser.email,
            toName: provUser.name,
            clientName: clientUser?.name ?? 'Un usuario',
            amount: paymentData.transaction_amount ?? 0,
            requestId,
          }).catch((e) => console.error('Webhook: payment email failed', e))
        }
      }

      const { error: userNotifError } = await supabase.from('notifications').insert({
        user_id: serviceReq.user_id,
        type: 'PROVIDER_EN_ROUTE',
        title: 'Prestador en camino',
        message: 'Tu pago fue confirmado. El prestador está en camino.',
        read: false,
      })
      if (userNotifError) console.error('Webhook: user notification failed', userNotifError)
    }
  } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
    const { error: refundError } = await supabase
      .from('payments')
      .update({ status: 'REFUNDED' })
      .eq('request_id', requestId)

    if (refundError) console.error('Webhook: failed to update payment to REFUNDED', refundError)
  }

  return NextResponse.json({ received: true })
}