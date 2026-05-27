import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserNavbar } from '@/components/shared/UserNavbar'
import { NotificationsInitializer } from '@/components/shared/NotificationsInitializer'
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

  const [
    { data: user },
    { count: unreadCount },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('read', false),
  ])

  if (!user) redirect('/login')
  if (user.role === 'ADMIN') redirect('/panel')

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <NotificationsInitializer
        userId={authUser.id}
        initialUnreadCount={unreadCount ?? 0}
      />
      <UserNavbar user={user as User} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
