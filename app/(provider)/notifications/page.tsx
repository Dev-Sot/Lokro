import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationsClient } from '@/app/(user)/notifications/NotificationsClient'

export const metadata: Metadata = { title: 'Notificaciones' }

export default async function ProviderNotificationsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unread = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground">{unread} sin leer</p>
          )}
        </div>
      </div>
      <NotificationsClient
        initialNotifications={notifications ?? []}
        userId={authUser.id}
      />
    </div>
  )
}
