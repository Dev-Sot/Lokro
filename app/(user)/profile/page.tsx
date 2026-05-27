import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProfileEditForm } from './ProfileEditForm'
import { formatRelativeTime } from '@/lib/utils'
import type { ServiceRequestStatus } from '@/types'

export const metadata: Metadata = { title: 'Mi perfil' }

export default async function UserProfilePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const { data: requests } = await supabase
    .from('service_requests')
    .select('id, status, created_at, category:categories(name, icon)')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <Badge className="mt-1" variant="secondary">{user.role}</Badge>
          </div>
        </div>
        <ProfileEditForm
          userId={user.id}
          currentName={user.name}
          currentAvatarUrl={user.avatar_url}
        />
      </div>

      <Separator />

      {/* Account info */}
      <section className="space-y-2">
        <h2 className="font-semibold">Información de la cuenta</h2>
        <div className="rounded-xl border divide-y">
          {[
            { label: 'Nombre', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Rol', value: user.role },
            { label: 'Miembro desde', value: formatRelativeTime(user.created_at) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Request history */}
      <section className="space-y-3">
        <h2 className="font-semibold">Historial de solicitudes</h2>
        {!requests || requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no tienes solicitudes.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const category = req.category as unknown as { name: string; icon: string } | null
              const href = req.status === 'IN_PROGRESS'
                ? `/tracking/${req.id}`
                : `/chat/${req.id}`

              return (
                <Link
                  key={req.id}
                  href={href}
                  className="flex items-center justify-between rounded-xl border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {category?.icon} {category?.name ?? 'Servicio'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(req.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={req.status as ServiceRequestStatus} />
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
