import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CancelRequestButton } from '@/components/admin/CancelRequestButton'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import type { ServiceRequestStatus } from '@/types'

const CANCELLABLE: ServiceRequestStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS']

export const metadata: Metadata = { title: 'Solicitudes — Admin' }

const PAGE_SIZE = 20

const STATUSES: ServiceRequestStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>
}

export default async function AdminSolicitudesPage({ searchParams }: Props) {
  const { page: pageParam, status } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const supabase = await createClient()

  let countQuery = supabase.from('service_requests').select('*', { count: 'exact', head: true })
  if (status && STATUSES.includes(status as ServiceRequestStatus)) {
    countQuery = countQuery.eq('status', status)
  }
  const { count: total } = await countQuery

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const from = (safePage - 1) * PAGE_SIZE

  let dataQuery = supabase
    .from('service_requests')
    .select(`
      id, status, description, estimated_price, created_at,
      user:users!service_requests_user_id_fkey(name),
      category:categories(name, icon)
    `)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (status && STATUSES.includes(status as ServiceRequestStatus)) {
    dataQuery = dataQuery.eq('status', status)
  }

  const { data: requests } = await dataQuery

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptada',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Solicitudes</h1>
          <p className="text-sm text-muted-foreground">{total ?? 0} en total</p>
        </div>

        {/* Status filter */}
        <form method="GET" className="flex gap-2 flex-wrap">
          <select
            name="status"
            defaultValue={status ?? ''}
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Filtrar
          </button>
          {status && (
            <a
              href="/panel/solicitudes"
              className="h-9 px-4 rounded-lg border text-sm font-medium flex items-center hover:bg-muted transition-colors"
            >
              Limpiar
            </a>
          )}
        </form>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Servicio</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Presupuesto</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {!requests || requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Sin resultados
                </td>
              </tr>
            ) : requests.map((req) => {
              const category = req.category as unknown as { name: string; icon: string } | null
              const user = req.user as unknown as { name: string } | null
              const status = req.status as ServiceRequestStatus
              return (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{category?.icon} {category?.name ?? 'Servicio'}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{req.description}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user?.name ?? '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {req.estimated_price ? formatCurrency(req.estimated_price) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatRelativeTime(req.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {CANCELLABLE.includes(status) && (
                      <CancelRequestButton requestId={req.id} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} />
    </div>
  )
}
