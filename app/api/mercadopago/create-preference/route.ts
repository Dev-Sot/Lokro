import { NextResponse } from 'next/server'
import { Preference } from 'mercadopago'
import { calculateFees } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { mpClient } = await import('@/lib/mercadopago')
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

  const { data: serviceRequest } = await supabase
    .from('service_requests')
    .select(`
      id, user_id, status, description,
      provider:provider_profiles(user:users(name)),
      category:categories(name, icon)
    `)
    .eq('id', requestId)
    .single()

  if (!serviceRequest || serviceRequest.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (serviceRequest.status !== 'ACCEPTED') {
    return NextResponse.json(
      { error: 'Request must be accepted before payment' },
      { status: 400 },
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const category = serviceRequest.category as unknown as { name: string; icon: string } | null
  const provider = serviceRequest.provider as unknown as { user: { name: string } } | null

  const preference = new Preference(mpClient)
  const result = await preference.create({
    body: {
      items: [
        {
          id: requestId,
          title: `${category?.icon ?? ''} ${category?.name ?? 'Servicio'} · ${provider?.user?.name ?? 'Prestador'}`.trim(),
          quantity: 1,
          unit_price: amount,
          currency_id: 'COP',
        },
      ],
      back_urls: {
        success: `${siteUrl}/pay/${requestId}/success`,
        failure: `${siteUrl}/pay/${requestId}?payment=failed`,
        pending: `${siteUrl}/pay/${requestId}/success?status=pending`,
      },
      auto_return: 'approved',
      external_reference: requestId,
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    },
  })

  const { platformFee, providerAmount } = calculateFees(amount)

  await supabase.from('payments').upsert({
    request_id: requestId,
    amount,
    platform_fee: platformFee,
    provider_amount: providerAmount,
    stripe_payment_intent: result.id,
    status: 'PENDING',
  })

  const isDev = process.env.NODE_ENV !== 'production'
  return NextResponse.json({
    initPoint: isDev ? result.sandbox_init_point : result.init_point,
    preferenceId: result.id,
  })
}