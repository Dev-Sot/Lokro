'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { setUserRole } from '@/app/actions/admin'
import type { UserRole } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Usuario',
  PROVIDER: 'Prestador',
  ADMIN: 'Admin',
}

interface Props {
  userId: string
  currentRole: UserRole
}

export function UserRoleSelect({ userId, currentRole }: Props) {
  const [role, setRole] = useState<UserRole>(currentRole)
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole
    startTransition(async () => {
      try {
        await setUserRole(userId, newRole)
        setRole(newRole)
        toast.success('Rol actualizado')
      } catch {
        toast.error('Error al cambiar el rol')
      }
    })
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={pending}
      className="h-7 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 cursor-pointer"
    >
      {(Object.keys(ROLE_LABELS) as UserRole[]).map((v) => (
        <option key={v} value={v}>{ROLE_LABELS[v]}</option>
      ))}
    </select>
  )
}
