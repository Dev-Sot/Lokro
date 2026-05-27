import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sendRequestAcceptedEmail,
  sendServiceCompletedEmail,
} from '@/lib/services/email'

export const dynamic = 'force-dynamic'

type EmailEvent = 'REQUEST_ACCEPTED' | 'SERVICE_COMPLETED'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.event || !body?.requestId) {
    return NextResponse.json({ error: 'Missing event or requestId' }, { status: 400 })
  }

  const event = body.event as EmailEvent
  const requestId = body.requestId as string

  const { data: req } = await supabase
    .from('service_requests')
    .select(`
      id,
      user:users!service_requests_user_id_fkey(id, name, email),
      provider:provider_profiles!service_requests_provider_id_fkey(
        user:users(id, name, email)
      )
    `)
    .eq('id', requestId)
    .single()

  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  const client = req.user as unknown as { id: string; name: string; email: string } | null
  const providerUser = (req.provider as unknown as { user: { id: string; name: string; email: string } } | null)?.user

  try {
    if (event === 'REQUEST_ACCEPTED' && client && providerUser) {
      await sendRequestAcceptedEmail({
        toEmail: client.email,
        toName: client.name,
        providerName: providerUser.name,
        requestId,
      })
    } else if (event === 'SERVICE_COMPLETED' && client && providerUser) {
      await sendServiceCompletedEmail({
        toEmail: client.email,
        toName: client.name,
        providerName: providerUser.name,
        requestId,
      })
    }
  } catch (err) {
    console.error('Email notify error:', err)
    // Don't return 500 — email failure shouldn't break the UI flow
  }

  return NextResponse.json({ sent: true })
}
