import type { Metadata } from 'next'
import Link from 'next/link'
import { Star, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StarRating } from '@/components/shared/StarRating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/Pagination'
import { ExploreFilters } from './ExploreFilters'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Explorar profesionales' }

const PAGE_SIZE = 12

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const { category, page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const supabase = await createClient()

  let providerIds: string[] | null = null

  if (category) {
    const { data: specs } = await supabase
      .from('provider_specialties')
      .select('provider_id')
      .eq('category_id', category)
    providerIds = specs?.map((s) => s.provider_id) ?? []
  }

  let countQuery = supabase
    .from('provider_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('available', true)

  if (providerIds !== null) {
    countQuery = providerIds.length === 0
      ? countQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      : countQuery.in('id', providerIds)
  }

  const { count } = await countQuery
  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('provider_profiles')
    .select(`
      id, hourly_rate, available, average_rating, total_reviews,
      user:users(name, avatar_url),
      specialties:provider_specialties(category:categories(id, name, icon, color))
    `)
    .eq('available', true)
    .order('average_rating', { ascending: false })
    .range(from, to)

  if (providerIds !== null) {
    query = providerIds.length === 0
      ? query.eq('id', '00000000-0000-0000-0000-000000000000')
      : query.in('id', providerIds)
  }

  const { data: providers } = await query

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Explorar profesionales</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {totalCount > 0
                  ? `${totalCount} profesional${totalCount !== 1 ? 'es' : ''} disponible${totalCount !== 1 ? 's' : ''} ahora`
                  : 'Busca el experto que necesitas'}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 hidden sm:flex">
              <Link href="/home">Ver mapa</Link>
            </Button>
          </div>

          {/* Category filters */}
          <div className="mt-5">
            <ExploreFilters active={category} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {providers && providers.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {providers.map((provider) => {
                const user = provider.user as unknown as { name: string; avatar_url: string | null } | null
                const specialties = provider.specialties as unknown as {
                  category: { id: string; name: string; icon: string; color: string }
                }[]
                const topSpecialty = specialties[0]?.category

                return (
                  <Link
                    key={provider.id}
                    href={`/providers/${provider.id}`}
                    className="group rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                  >
                    {/* Color header based on specialty */}
                    <div
                      className="h-2"
                      style={{
                        background: topSpecialty?.color
                          ? `linear-gradient(90deg, ${topSpecialty.color}80, ${topSpecialty.color}20)`
                          : 'linear-gradient(90deg, var(--primary) / 0.3, transparent)',
                      }}
                    />

                    <div className="p-4 space-y-4">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <UserAvatar name={user?.name ?? '?'} avatarUrl={user?.avatar_url} size="md" />
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {user?.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium">{provider.average_rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({provider.total_reviews})</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                        {specialties.slice(0, 2).map(({ category: cat }) => (
                          <span
                            key={cat.id}
                            className="text-[11px] px-2 py-0.5 rounded-full font-medium leading-5"
                            style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                          >
                            {cat.icon} {cat.name}
                          </span>
                        ))}
                        {specialties.length > 2 && (
                          <Badge variant="secondary" className="text-[11px] h-5">
                            +{specialties.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-1 border-t">
                        <div>
                          <p className="text-sm font-bold">{formatCurrency(provider.hourly_rate)}</p>
                          <p className="text-[10px] text-muted-foreground">por hora</p>
                        </div>
                        <span className="text-xs font-semibold text-primary group-hover:underline">
                          Ver perfil →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-8">
              <Pagination currentPage={safePage} totalPages={totalPages} />
            </div>
          </>
        ) : (
          <div className="text-center py-24 space-y-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Search size={32} className="text-muted-foreground opacity-50" />
            </div>
            <p className="text-lg font-semibold">No hay prestadores disponibles</p>
            <p className="text-sm text-muted-foreground">Prueba con otra categoría o vuelve más tarde.</p>
            <Button variant="outline" asChild>
              <Link href="/explore">Ver todos</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
