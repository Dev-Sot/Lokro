import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Pagination } from '@/components/shared/Pagination'
import { AcceptRejectButtons } from '@/components/requests/AcceptRejectButtons'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import type { ServiceRequestStatus } from '@/types'

export const metadata: Metadata = { title: 'Solicitudes' }

const HISTORY_PAGE_SIZE = 10

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function ProviderRequestsPage({ searchParams }: Props) {
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

  // Active requests — load all (usually small number)
  const { data: activeRequests } = await supabase
    .from('service_requests')
    .select(`
      id, status, description, estimated_price, final_price, created_at, requested_date,
      user_id,
      user:users!service_requests_user_id_fkey(id, name, avatar_url),
      category:categories(name, icon)
    `)
    .eq('provider_id', profile.id)
    .in('status', ['PENDING', 'ACCEPTED', 'IN_PROGRESS'])
    .order('created_at', { ascending: false })

  // Paginated history (completed + cancelled)
  const { count: historyCount } = await supabase
    .from('service_requests')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', profile.id)
    .in('status', ['COMPLETED', 'CANCELLED'])

  const totalHistory = historyCount ?? 0
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistory / HISTORY_PAGE_SIZE))
  const safePage = Math.min(currentPage, totalHistoryPages)
  const from = (safePage - 1) * HISTORY_PAGE_SIZE
  const to = from + HISTORY_PAGE_SIZE - 1

  const { data: historyRequests } = await supabase
    .from('service_requests')
    .select(`
      id, status, description, estimated_price, final_price, created_at, requested_date,
      user_id,
      user:users!service_requests_user_id_fkey(id, name, avatar_url),
      category:categories(name, icon)
    `)
    .eq('provider_id', profile.id)
    .in('status', ['COMPLETED', 'CANCELLED'])
    .order('created_at', { ascending: false })
    .range(from, to)

  const completedItems = historyRequests?.filter((r) => r.status === 'COMPLETED') ?? []
  const cancelledItems = historyRequests?.filter((r) => r.status === 'CANCELLED') ?? []

  type RequestItem = NonNullable<typeof activeRequests>[number]

  function RequestList({ items }: { items: RequestItem[] }) {
    if (items.length === 0) {
      return (
        <p className="text-center py-12 text-muted-foreground text-sm">
          Sin solicitudes en esta categoría
        </p>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((req) => {
          const user = req.user as unknown as { id: string; name: string; avatar_url: string | null } | null
          const category = req.category as unknown as { name: string; icon: string } | null
          return (
            <div key={req.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <UserAvatar name={user?.name ?? '?'} avatarUrl={user?.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category?.icon} {category?.name}
                      </p>
                    </div>
                    <StatusBadge status={req.status as ServiceRequestStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                    {req.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(req.created_at)}</span>
                    {req.estimated_price && (
                      <span className="font-medium text-foreground">
                        {formatCurrency(req.estimated_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {req.status === 'PENDING' ? (
                <AcceptRejectButtons
                  requestId={req.id}
                  clientUserId={user?.id ?? req.user_id}
                  providerUserId={authUser!.id}
                  providerName={authUser!.email ?? 'El prestador'}
                />
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/chat/${req.id}`}>Abrir chat</Link>
                  </Button>
                  {req.status === 'ACCEPTED' && (
                    <Button size="sm" asChild className="flex-1">
                      <Link href={`/tracking/${req.id}`}>Seguimiento</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis solicitudes</h1>

      <Tabs defaultValue="active">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="active">
            Activas ({activeRequests?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <RequestList items={activeRequests ?? []} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-4">
          <RequestList items={completedItems} />
          <Pagination currentPage={safePage} totalPages={totalHistoryPages} />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4 space-y-4">
          <RequestList items={cancelledItems} />
          <Pagination currentPage={safePage} totalPages={totalHistoryPages} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
