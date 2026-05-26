import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Panel de control' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .single()

  if (!profile) redirect('/home')

  return <DashboardClient initialProfile={profile} userId={authUser.id} />
}
