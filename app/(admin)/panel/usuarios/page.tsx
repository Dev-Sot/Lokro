import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/shared/Pagination'
import { UserRoleSelect } from '@/components/admin/UserRoleSelect'
import { formatRelativeTime } from '@/lib/utils'
import type { UserRole } from '@/types'

export const metadata: Metadata = { title: 'Usuarios — Admin' }

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{ page?: string; role?: string; q?: string }>
}

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const { page: pageParam, role, q } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const supabase = await createClient()

  let query = supabase.from('users').select('id, name, email, role, created_at, avatar_url', { count: 'exact' })

  if (role && ['USER', 'PROVIDER', 'ADMIN'].includes(role)) {
    query = query.eq('role', role)
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { count: total } = await query

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const from = (safePage - 1) * PAGE_SIZE

  let dataQuery = supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (role && ['USER', 'PROVIDER', 'ADMIN'].includes(role)) {
    dataQuery = dataQuery.eq('role', role)
  }
  if (q) {
    dataQuery = dataQuery.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: users } = await dataQuery

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">{total ?? 0} registrados</p>
        </div>

        {/* Filters */}
        <form method="GET" className="flex gap-2 flex-wrap">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre o email…"
            className="h-9 rounded-lg border bg-background px-3 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <select
            name="role"
            defaultValue={role ?? ''}
            className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Todos los roles</option>
            <option value="USER">Usuario</option>
            <option value="PROVIDER">Prestador</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Filtrar
          </button>
          {(q || role) && (
            <a
              href="/panel/usuarios"
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!users || users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Sin resultados
                </td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <UserRoleSelect userId={u.id} currentRole={u.role as UserRole} />
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {formatRelativeTime(u.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={safePage} totalPages={totalPages} />
    </div>
  )
}
