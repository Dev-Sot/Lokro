'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

interface Props {
  userId: string
  initialUnreadCount: number
}

export function NotificationsInitializer({ userId, initialUnreadCount }: Props) {
  const setUnreadNotifications = useUserStore((s) => s.setUnreadNotifications)

  useEffect(() => {
    setUnreadNotifications(initialUnreadCount)
  }, [initialUnreadCount, setUnreadNotifications])

  useRealtimeNotifications(userId)

  return null
}
