import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Star,
  Clock,
  ArrowRight,
  CheckCircle,
  Briefcase,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StarRating } from '@/components/shared/StarRating'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('provider_profiles')
    .select('bio, user:users(name)')
    .eq('id', id)
    .single()

  const name = (data?.user as { name?: string })?.name ?? 'Prestador'
  return { title: name, description: data?.bio ?? undefined }
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      id, bio, hourly_rate, available, average_rating, total_reviews, created_at,
      user:users(id, name, email, avatar_url, latitude, longitude),
      specialties:provider_specialties(category:categories(id, name, icon, color)),
      portfolio:provider_portfolio(id, image_url, created_at)
    `)
    .eq('id', id)
    .single()

  if (!provider) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, type, author:users(name, avatar_url)')
    .eq('target_id', (provider.user as unknown as { id: string }).id)
    .eq('type', 'TO_PROVIDER')
    .order('created_at', { ascending: false })
    .limit(10)

  const user = provider.user as unknown as {
    id: string; name: string; email: string;
    avatar_url: string | null; latitude: number | null; longitude: number | null
  }

  const specialties = provider.specialties as unknown as {
    category: { id: string; name: string; icon: string; color: string }
  }[]

  const portfolio = provider.portfolio as unknown as {
    id: string; image_url: string; created_at: string
  }[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="relative shrink-0">
          <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
              provider.available ? 'bg-green-500' : 'bg-muted-foreground'
            }`}
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StarRating rating={provider.average_rating} showValue />
                <span className="text-sm text-muted-foreground">
                  ({provider.total_reviews} reseñas)
                </span>
                <Badge variant={provider.available ? 'default' : 'secondary'}>
                  {provider.available ? '● Disponible ahora' : 'No disponible'}
                </Badge>
              </div>
            </div>
            <Button asChild className="ml-auto">
              <Link href={`/request/${id}`}>
                Solicitar servicio
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Miembro desde {new Date(provider.created_at).getFullYear()}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              {formatCurrency(provider.hourly_rate)}/hora
            </span>
            {user.latitude && user.longitude && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                Colombia
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {specialties.map(({ category }) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                {category.icon} {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          {provider.bio && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase size={18} />
                Sobre mí
              </h2>
              <p className="text-muted-foreground leading-relaxed">{provider.bio}</p>
            </section>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Portafolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-xl overflow-hidden bg-muted relative"
                  >
                    <Image
                      src={item.image_url}
                      alt="Portfolio"
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reseñas</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {provider.average_rating.toFixed(1)}
                </span>
                <span>· {provider.total_reviews} reseñas</span>
              </div>
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const author = review.author as unknown as { name: string; avatar_url: string | null }
                  return (
                    <div key={review.id} className="flex gap-3">
                      <UserAvatar name={author.name} avatarUrl={author.avatar_url} size="sm" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{author.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(review.created_at)}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay reseñas.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border p-5 space-y-4 sticky top-24">
            <div className="text-center">
              <p className="text-3xl font-bold">{formatCurrency(provider.hourly_rate)}</p>
              <p className="text-sm text-muted-foreground">por hora</p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href={`/request/${id}`}>Reservar ahora</Link>
            </Button>
            <Separator />
            <div className="space-y-2.5 text-sm">
              {[
                'Pago seguro garantizado',
                'Cancelación gratuita 24h antes',
                'Comunicación directa',
                'Soporte 24/7',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
