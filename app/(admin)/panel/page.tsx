import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Briefcase, ClipboardList, DollarSign, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { ServiceRequestStatus } from '@/types'

export const metadata: Metadata = { title: 'Panel Admin' }

async function checkMercadoPago(): Promise<boolean> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) return false
  try {
    const res = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    })
    return res.ok
  } catch {
    return false
  }
}

export default async function AdminPanelPage() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: providersCount },
    { count: requestsCount },
    { data: paymentsData },
    { data: recentRequests },
    { data: recentUsers },
    mpOk,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount, platform_fee').eq('status', 'PAID'),
    supabase
      .from('service_requests')
      .select('id, status, created_at, description, category:categories(name, icon), user:users!service_requests_user_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    checkMercadoPago(),
  ])

  const supabaseOk = usersCount !== null
  const mapboxOk = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const storageOk = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const totalRevenue = paymentsData?.reduce((sum, p) => sum + p.platform_fee, 0) ?? 0

  const stats = [
    { label: 'Usuarios', value: usersCount ?? 0, icon: Users, color: 'text-blue-500', href: '/panel/usuarios' },
    { label: 'Prestadores', value: providersCount ?? 0, icon: Briefcase, color: 'text-purple-500', href: '/panel/prestadores' },
    { label: 'Solicitudes', value: requestsCount ?? 0, icon: ClipboardList, color: 'text-amber-500', href: '/panel/solicitudes' },
    { label: 'Ingresos plataforma', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-500', href: '/panel/solicitudes' },
  ]

  const services = [
    { label: 'Supabase (base de datos)', ok: supabaseOk },
    { label: 'Mercado Pago (pagos)', ok: mpOk },
    { label: 'Mapbox (mapas)', ok: mapboxOk },
    { label: 'Supabase Storage', ok: storageOk },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-muted-foreground">Vista general de la plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="rounded-xl border bg-card p-5 space-y-2 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon size={18} className={color} />
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent requests */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold">Solicitudes recientes</h2>
            <Link href="/panel/solicitudes" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y">
            {!recentRequests || recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-6">Sin solicitudes.</p>
            ) : recentRequests.map((req) => {
              const category = req.category as unknown as { name: string; icon: string } | null
              const user = req.user as unknown as { name: string } | null
              return (
                <div key={req.id} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {category?.icon} {category?.name ?? 'Servicio'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.name} · {formatRelativeTime(req.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={req.status as ServiceRequestStatus} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold">Usuarios recientes</h2>
            <Link href="/panel/usuarios" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y">
            {!recentUsers || recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground px-5 py-6">Sin usuarios.</p>
            ) : recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  u.role === 'PROVIDER'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                    : u.role === 'ADMIN'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Estado del sistema</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {services.map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-muted-foreground">{label}</span>
              <span className={`inline-flex items-center gap-1.5 font-medium ${ok ? 'text-green-600' : 'text-destructive'}`}>
                {ok
                  ? <CheckCircle2 size={14} className="text-green-500" />
                  : <XCircle size={14} className="text-destructive" />}
                {ok ? 'Activo' : 'Error'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
