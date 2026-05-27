'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

const ASSIGNABLE_ROLES = ['USER', 'PROVIDER'] as const
const roleSchema = z.enum(ASSIGNABLE_ROLES)

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') throw new Error('Forbidden')
  return supabase
}

export async function setUserRole(userId: string, role: UserRole) {
  const parsed = roleSchema.safeParse(role)
  if (!parsed.success) throw new Error('Invalid role')
  const supabase = await requireAdmin()
  const { error } = await supabase.from('users').update({ role: parsed.data }).eq('id', userId)
  if (error) throw new Error('Failed to update role')
  revalidatePath('/panel/usuarios')
}

export async function cancelRequest(requestId: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase
    .from('service_requests')
    .update({ status: 'CANCELLED' })
    .eq('id', requestId)
    .in('status', ['PENDING', 'ACCEPTED', 'IN_PROGRESS'])
  if (error) throw new Error('Failed to cancel request')
  revalidatePath('/panel/solicitudes')
}
