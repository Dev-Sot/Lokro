import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/shared/Pagination'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Prestadores — Admin' }

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{ page?: string; available?: string }>
}

export default async function AdminPrestadoresPage({ searchParams }: Props) {
  const { page: pageParam, available } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const supabase = await createClient()

  let countQuery = supabase.from('provider_profiles').select('*', { count: 'exact', head: true })
  if (available === '1') countQuery = countQuery.eq('available', true)
  if (available === '0') countQuery = countQuery.eq('available', false)
  const { count: total } = await countQuery

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const from = (safePage - 1) * PAGE_SIZE

  let dataQuery = supabase
    .from('provider_profiles')
    .select(`
      id, hourly_rate, available, average_rating, total_reviews, created_at,
      user:users(name, email)
    `)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (available === '1') dataQuery = dataQuery.eq('available', true)
  if (available === '0') dataQuery = dataQuery.eq('available', false)

  const { data: providers } = await dataQuery

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Prestadores</h1>
          <p className="text-sm text-muted-foreground">{total ?? 0} registrados</p>
        </div>

        <form method="GET" className="flex gap-2">
          <select
            name="available"
            defaultValue={available ?? ''}
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos</option>
            <option value="1">Disponibles</option>
            <option value="0">No disponibles</option>
          </select>
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Filtrar
          </button>
          {available && (
            <a
              href="/panel/prestadores"
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prestador</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tarifa/hora</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Rating</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Disponible</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!providers || providers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Sin resultados
                </td>
              </tr>
            ) : providers.map((p) => {
              const user = p.user as unknown as { name: string; email: string } | null
              return (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{formatCurrency(p.hourly_rate)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      {p.average_rating.toFixed(1)}
                      <span className="text-muted-foreground">({p.total_reviews})</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {p.available ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatRelativeTime(p.created_at)}
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
