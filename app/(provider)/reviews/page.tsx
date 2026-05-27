import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StarRating } from '@/components/shared/StarRating'
import { formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Mis reseñas' }

export default async function ProviderReviewsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, author:users(name, avatar_url)')
    .eq('target_id', authUser.id)
    .eq('type', 'TO_PROVIDER')
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('average_rating, total_reviews')
    .eq('user_id', authUser.id)
    .single()

  const list = (reviews ?? []) as unknown as {
    id: string
    rating: number
    comment: string | null
    created_at: string
    author: { name: string; avatar_url: string | null } | null
  }[]

  // Distribution 1–5 stars
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }))
  const total = list.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Mis reseñas</h1>
        <p className="text-muted-foreground mt-1">Lo que dicen tus clientes sobre tu trabajo</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border bg-card p-6 flex flex-col sm:flex-row gap-6 items-center">
        <div className="text-center sm:border-r sm:pr-8">
          <p className="text-6xl font-bold">{(profile?.average_rating ?? 0).toFixed(1)}</p>
          <StarRating rating={profile?.average_rating ?? 0} size={18} className="justify-center mt-2" />
          <p className="text-sm text-muted-foreground mt-1">{total} reseña{total !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          {dist.map(({ star, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right text-muted-foreground">{star}</span>
                <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-7 text-right text-muted-foreground">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="rounded-2xl border bg-muted/30 p-12 text-center text-muted-foreground">
          <Star size={36} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Aún no tienes reseñas</p>
          <p className="text-sm mt-1">Cuando un cliente complete un servicio contigo podrá dejarte una calificación.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((review) => (
            <div key={review.id} className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={review.author?.name ?? '?'}
                    avatarUrl={review.author?.avatar_url ?? null}
                    size="sm"
                  />
                  <p className="text-sm font-medium">{review.author?.name ?? 'Cliente'}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelativeTime(review.created_at)}
                </span>
              </div>

              <StarRating rating={review.rating} size={14} />

              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
