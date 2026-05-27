import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserNavbar } from '@/components/shared/UserNavbar'
import { ProviderNavbar } from '@/components/shared/ProviderNavbar'
import { NotificationsClient } from '@/app/(user)/notifications/NotificationsClient'
import type { User } from '@/types'

export const metadata: Metadata = { title: 'Notificaciones' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unread = notifications?.filter((n) => !n.read).length ?? 0
  const isProvider = user.role === 'PROVIDER'

  return (
    <div className="min-h-screen flex flex-col">
      {isProvider
        ? <ProviderNavbar user={user as User} />
        : <UserNavbar user={user as User} />
      }
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            {unread > 0 && (
              <p className="text-sm text-muted-foreground">{unread} sin leer</p>
            )}
          </div>
          <NotificationsClient
            initialNotifications={notifications ?? []}
            userId={authUser.id}
          />
        </div>
      </main>
    </div>
  )
}
