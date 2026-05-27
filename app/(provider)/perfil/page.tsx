import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from './ProfileClient'

export const metadata: Metadata = { title: 'Mi perfil' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .single()

  if (!user || !profile) redirect('/home')

  const [{ data: categories }, { data: specialties }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('provider_specialties')
      .select('*, category:categories(*)')
      .eq('provider_id', profile.id),
  ])

  return (
    <ProfileClient
      user={user}
      profile={profile}
      categories={categories ?? []}
      specialties={specialties ?? []}
    />
  )
}
