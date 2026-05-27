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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, author:users(name, avatar_url)')
    .eq('target_id', authUser.id)
    .eq('type', 'TO_PROVIDER')
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      initialProfile={profile}
      userId={authUser.id}
      reviews={(reviews ?? []) as unknown as import('./DashboardClient').ReviewItem[]}
    />
  )
}
