import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Pagination } from '@/components/shared/Pagination'
import { EarningsExportButton } from '@/components/provider/EarningsExportButton'
import { DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react'
import type { ServiceRequestStatus } from '@/types'

export const metadata: Metadata = { title: 'Ingresos' }

const PAGE_SIZE = 10

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function EarningsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', authUser.id)
    .single()

  if (!profile) redirect('/home')

  // Get all request IDs for this provider
  const { data: requestIds } = await supabase
    .from('service_requests')
    .select('id')
    .eq('provider_id', profile.id)

  const ids = requestIds?.map((r) => r.id) ?? []

  if (ids.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">Ingresos</h1>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Total acumulado', value: formatCurrency(0), icon: DollarSign },
            { label: 'Últimos 30 días', value: formatCurrency(0), icon: TrendingUp },
            { label: 'Comisión plataforma', value: formatCurrency(0), icon: ArrowUpRight },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon size={16} className="text-primary" />
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm py-8 text-center">
          Aún no tienes pagos registrados.
        </p>
      </div>
    )
  }

  // Summary stats — fetch all paid payments for totals
  const { data: allPayments } = await supabase
    .from('payments')
    .select('provider_amount, platform_fee, created_at')
    .eq('status', 'PAID')
    .in('request_id', ids)

  const totalEarnings = allPayments?.reduce((sum, p) => sum + p.provider_amount, 0) ?? 0
  const totalFees = allPayments?.reduce((sum, p) => sum + p.platform_fee, 0) ?? 0
  const last30Days = allPayments
    ?.filter((p) => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, p) => sum + p.provider_amount, 0) ?? 0

  // Paginated payment history
  const { count: totalCount } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'PAID')
    .in('request_id', ids)

  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id, amount, platform_fee, provider_amount, status, created_at,
      request:service_requests(description, status, category:categories(name, icon))
    `)
    .eq('status', 'PAID')
    .in('request_id', ids)
    .order('created_at', { ascending: false })
    .range(from, to)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Ingresos</h1>
        <EarningsExportButton />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total acumulado', value: formatCurrency(totalEarnings), icon: DollarSign },
          { label: 'Últimos 30 días', value: formatCurrency(last30Days), icon: TrendingUp },
          { label: 'Comisión plataforma', value: formatCurrency(totalFees), icon: ArrowUpRight },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Historial de pagos</h2>
          {total > 0 && (
            <p className="text-xs text-muted-foreground">
              {from + 1}–{Math.min(to + 1, total)} de {total}
            </p>
          )}
        </div>

        {!payments || payments.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Aún no tienes pagos registrados.
          </p>
        ) : (
          <>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Servicio</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Fecha</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => {
                    const req = payment.request as unknown as {
                      description: string
                      status: string
                      category: { name: string; icon: string }
                    } | null
                    return (
                      <tr key={payment.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-xs">
                            {req?.category?.icon} {req?.category?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {req?.description}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {formatRelativeTime(payment.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(payment.provider_amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            -{formatCurrency(payment.platform_fee)} comisión
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={safePage} totalPages={totalPages} />
          </>
        )}
      </section>
    </div>
  )
}
