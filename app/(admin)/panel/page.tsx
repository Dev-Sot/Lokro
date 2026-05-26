import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Users, Briefcase, ClipboardList, DollarSign } from 'lucide-react'

export const metadata: Metadata = { title: 'Panel Admin' }

export default async function AdminPanelPage() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: providersCount },
    { count: requestsCount },
    { data: paymentsData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'PAID'),
  ])

  const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount * 0.1), 0) ?? 0

  const stats = [
    { label: 'Usuarios', value: usersCount ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Prestadores', value: providersCount ?? 0, icon: Briefcase, color: 'text-purple-500' },
    { label: 'Solicitudes', value: requestsCount ?? 0, icon: ClipboardList, color: 'text-amber-500' },
    { label: 'Ingresos plataforma', value: `$${(totalRevenue / 100).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-muted-foreground">Vista general de la plataforma</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon size={18} className={color} />
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Estado del sistema</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Supabase Realtime', status: 'Activo' },
            { label: 'Stripe Webhooks', status: 'Activo' },
            { label: 'Mapbox', status: 'Activo' },
            { label: 'Storage (avatars/portfolios)', status: 'Activo' },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
