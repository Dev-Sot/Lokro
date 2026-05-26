import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatRelativeTime } from '@/lib/utils'

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
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <Badge className="mt-1" variant="secondary">{user.role}</Badge>
        </div>
      </div>

      <Separator />

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

      <section className="space-y-3">
        <h2 className="font-semibold">Historial de solicitudes</h2>
        {!requests || requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no tienes solicitudes.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const category = req.category as unknown as { name: string; icon: string } | null
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {category?.icon} {category?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(req.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      req.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
