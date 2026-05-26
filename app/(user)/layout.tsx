import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserNavbar } from '@/components/shared/UserNavbar'
import type { User } from '@/types'

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  if (!user) redirect('/login')
  if (user.role === 'PROVIDER') redirect('/provider/dashboard')
  if (user.role === 'ADMIN') redirect('/admin/panel')

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <UserNavbar user={user as User} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
