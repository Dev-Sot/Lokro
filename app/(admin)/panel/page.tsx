import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Users, Briefcase, ClipboardList, DollarSign, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
    mpOk,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount, platform_fee').eq('status', 'PAID'),
    checkMercadoPago(),
  ])

  const supabaseOk = usersCount !== null
  const mapboxOk = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const storageOk = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  const totalRevenue = paymentsData?.reduce((sum, p) => sum + p.platform_fee, 0) ?? 0

  const stats = [
    { label: 'Usuarios', value: usersCount ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Prestadores', value: providersCount ?? 0, icon: Briefcase, color: 'text-purple-500' },
    { label: 'Solicitudes', value: requestsCount ?? 0, icon: ClipboardList, color: 'text-amber-500' },
    { label: 'Ingresos plataforma', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-500' },
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
        <div className="space-y-3 text-sm">
          {services.map(({ label, ok }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  ok ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {ok
                  ? <CheckCircle2 size={14} className="text-green-500" />
                  : <XCircle size={14} className="text-destructive" />
                }
                {ok ? 'Activo' : 'Error'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}