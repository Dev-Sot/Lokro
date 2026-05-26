import { NextResponse } from 'next/server'
import { calculateFees } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { stripe } = await import('@/lib/stripe')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { requestId, amount } = body

  if (!requestId || !amount || amount < 100) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  // Verify ownership
  const { data: serviceRequest } = await supabase
    .from('service_requests')
    .select('id, user_id, status')
    .eq('id', requestId)
    .single()

  if (!serviceRequest || serviceRequest.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (serviceRequest.status !== 'ACCEPTED') {
    return NextResponse.json(
      { error: 'Request must be accepted before payment' },
      { status: 400 }
    )
  }

  const { platformFee, providerAmount } = calculateFees(amount)

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { requestId, userId: user.id },
    capture_method: 'manual',
  })

  // Create payment record
  await supabase.from('payments').upsert({
    request_id: requestId,
    amount,
    platform_fee: platformFee,
    provider_amount: providerAmount,
    stripe_payment_intent: paymentIntent.id,
    status: 'PENDING',
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
