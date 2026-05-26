import { createClient } from '@/lib/supabase/server'
import type { NotificationType } from '@/types'

export async function createNotification({
  userId,
  type,
  title,
  message,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    read: false,
  })
  if (error) throw error
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
}
