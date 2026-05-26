'use client'

import { create } from 'zustand'
import type { User } from '@/types'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  unreadNotifications: number
  setUnreadNotifications: (count: number) => void
  incrementUnread: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  unreadNotifications: 0,
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  incrementUnread: () =>
    set((state) => ({ unreadNotifications: state.unreadNotifications + 1 })),
}))
