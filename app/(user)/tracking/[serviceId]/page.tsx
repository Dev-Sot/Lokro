import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrackingClient } from './TrackingClient'

interface Props {
  params: Promise<{ serviceId: string }>
}

export const metadata: Metadata = { title: 'Seguimiento' }

export default async function TrackingPage({ params }: Props) {
  const { serviceId } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: request } = await supabase
    .from('service_requests')
    .select(`
      id, status, description, address, latitude, longitude,
      user_id, provider_id,
      user:users!service_requests_user_id_fkey(id, name, avatar_url, email, role, created_at),
      provider:provider_profiles!service_requests_provider_id_fkey(
        id,
        user:users(id, name, avatar_url, email, role, created_at)
      ),
      category:categories(name, icon)
    `)
    .eq('id', serviceId)
    .single()

  if (!request) notFound()

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  const isProvider = userRow?.role === 'PROVIDER'

  if (isProvider) {
    // Verify the logged-in provider is the one assigned to this request
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', authUser.id)
      .single()
    if (!providerProfile || providerProfile.id !== request.provider_id) redirect('/home')
  } else if (request.user_id !== authUser.id) {
    redirect('/home')
  }

  const { data: statusHistory } = await supabase
    .from('service_status_history')
    .select('*')
    .eq('request_id', serviceId)
    .order('created_at', { ascending: true })

  return (
    <TrackingClient
      request={request as unknown as Parameters<typeof TrackingClient>[0]['request']}
      statusHistory={statusHistory ?? []}
      currentUserId={authUser.id}
      isProvider={isProvider}
    />
  )
}
