'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import type { Notification } from '@/types'

export function useRealtimeNotifications(userId: string | undefined) {
  const incrementUnread = useUserStore((s) => s.incrementUnread)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          if (!notification.read) incrementUnread()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // Only depend on userId — incrementUnread is stable from zustand but adding it
  // would cause a new subscription every time the store updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
