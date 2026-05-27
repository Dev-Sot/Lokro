'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, cn } from '@/lib/utils'
import { NOTIFICATION_LABELS } from '@/constants'
import { useUserStore } from '@/store/useUserStore'
import type { Notification } from '@/types'

interface NotificationsClientProps {
  initialNotifications: Notification[]
  userId: string
}

export function NotificationsClient({
  initialNotifications,
  userId,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const { setUnreadNotifications } = useUserStore()

  // Mark all as read on mount
  useEffect(() => {
    const supabase = createClient()

    async function markAllRead() {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('NotificationsClient: failed to mark notifications as read', error)
        return
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadNotifications(0)
    }

    markAllRead().catch((err) =>
      console.error('NotificationsClient: unexpected error', err)
    )

    // Subscribe to new ones
    const channel = supabase
      .channel(`notifications-page:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, setUnreadNotifications])

  const NOTIFICATION_ICONS: Record<string, string> = {
    NEW_REQUEST: '📋',
    REQUEST_ACCEPTED: '✅',
    PROVIDER_EN_ROUTE: '🚗',
    SERVICE_COMPLETED: '🎉',
    NEW_REVIEW: '⭐',
    PAYMENT_RECEIVED: '💰',
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Bell size={48} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium">Sin notificaciones</p>
        <p className="text-sm">Cuando haya actividad en tu cuenta, lo verás aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'rounded-xl border p-4 flex gap-3 transition-colors',
            !notification.read && 'bg-primary/5 border-primary/20'
          )}
        >
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
            {NOTIFICATION_ICONS[notification.type] ?? '🔔'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{notification.title}</p>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatRelativeTime(notification.created_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {NOTIFICATION_LABELS[notification.type]}
            </p>
          </div>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
          )}
        </div>
      ))}
    </div>
  )
}
