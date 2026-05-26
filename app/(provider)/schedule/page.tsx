import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatRelativeTime } from '@/lib/utils'
import type { ServiceRequestStatus } from '@/types'

export const metadata: Metadata = { title: 'Agenda' }

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', authUser.id)
    .single()

  if (!profile) redirect('/home')

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const { data: upcoming } = await supabase
    .from('service_requests')
    .select(`
      id, status, description, requested_date,
      user:users!service_requests_user_id_fkey(name),
      category:categories(name, icon)
    `)
    .eq('provider_id', profile.id)
    .in('status', ['ACCEPTED', 'IN_PROGRESS', 'PENDING'])
    .gte('requested_date', new Date().toISOString())
    .order('requested_date', { ascending: true })
    .limit(20)

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Agenda</h1>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
        {days.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startOfWeek)
          date.setDate(date.getDate() + i)
          const isToday = date.toDateString() === new Date().toDateString()
          const dayRequests = upcoming?.filter((r) => {
            const rd = new Date(r.requested_date)
            return rd.toDateString() === date.toDateString()
          }) ?? []

          return (
            <div
              key={i}
              className={`rounded-xl p-2 min-h-[80px] border text-left text-xs ${
                isToday ? 'border-primary bg-primary/5' : 'bg-card'
              }`}
            >
              <p className={`font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                {date.getDate()}
              </p>
              {dayRequests.map((r) => {
                const category = r.category as unknown as { name: string; icon: string } | null
                return (
                  <div key={r.id} className="rounded bg-primary/10 px-1.5 py-0.5 mb-1 truncate">
                    {category?.icon} {category?.name}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Próximas citas</h2>
        {!upcoming || upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No tienes citas próximas programadas.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((req) => {
              const user = req.user as unknown as { name: string } | null
              const category = req.category as unknown as { name: string; icon: string } | null
              const date = new Date(req.requested_date)
              return (
                <div
                  key={req.id}
                  className="rounded-xl border bg-card p-4 flex items-center gap-4"
                >
                  <div className="text-center shrink-0 w-12">
                    <p className="text-2xl font-bold leading-none">{date.getDate()}</p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleString('es-ES', { month: 'short' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category?.icon} {category?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {req.description}
                    </p>
                  </div>
                  <StatusBadge status={req.status as ServiceRequestStatus} />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
