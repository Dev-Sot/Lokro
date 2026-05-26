import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StarRating } from '@/components/shared/StarRating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/constants'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Explorar' }

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: providers } = await supabase
    .from('provider_profiles')
    .select(`
      id, hourly_rate, available, average_rating, total_reviews,
      user:users(name, avatar_url),
      specialties:provider_specialties(category:categories(id, name, icon, color))
    `)
    .eq('available', true)
    .order('average_rating', { ascending: false })
    .limit(24)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Explorar profesionales</h1>
        <p className="text-muted-foreground mt-1">Encuentra el experto perfecto para tu necesidad</p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button variant="default" size="sm" className="shrink-0">Todos</Button>
        {CATEGORIES.map((cat) => (
          <Button key={cat.id} variant="outline" size="sm" className="shrink-0 gap-1.5">
            <span>{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Provider grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {providers?.map((provider) => {
          const user = provider.user as unknown as { name: string; avatar_url: string | null } | null
          const specialties = (provider.specialties as unknown as { category: { id: string; name: string; icon: string; color: string } }[])
          return (
            <div key={provider.id} className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <UserAvatar name={user?.name ?? '?'} avatarUrl={user?.avatar_url} size="md" />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${provider.available ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.name}</p>
                  <StarRating rating={provider.average_rating} size={11} showValue />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {specialties.slice(0, 2).map(({ category }) => (
                  <span
                    key={category.id}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.icon} {category.name}
                  </span>
                ))}
                {specialties.length > 2 && (
                  <Badge variant="secondary" className="text-[11px]">+{specialties.length - 2}</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{formatCurrency(provider.hourly_rate)}<span className="text-xs font-normal text-muted-foreground">/h</span></p>
                <Button size="sm" asChild>
                  <Link href={`/providers/${provider.id}`}>Ver perfil</Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
