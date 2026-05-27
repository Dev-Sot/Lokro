import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Star, Clock, ArrowRight, CheckCircle,
  Briefcase, ArrowLeft, Calendar, MessageCircle,
} from 'lucide-react'

const CATEGORY_HERO: Record<string, string> = {
  'Plomería':     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=75',
  'Electricidad': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=75',
  'Limpieza':     'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&q=75',
  'Tutoría':      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=75',
  'Mecánica':     'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=75',
  'Tecnología':   'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=75',
  'Cocina':       'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=75',
  'Diseño':       'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=75',
  'Reparaciones': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=75',
}
const DEFAULT_HERO = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=75'
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
    .select('bio, user:users(name, avatar_url)')
    .eq('id', id)
    .single()

  const user = data?.user as { name?: string; avatar_url?: string | null } | null
  const name = user?.name ?? 'Prestador'
  const description = data?.bio ?? `Perfil de ${name} en Lokro — servicios locales a tu alcance.`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} — Lokro`,
      description,
      url: `${siteUrl}/providers/${id}`,
      siteName: 'Lokro',
      locale: 'es_ES',
      type: 'profile',
      ...(user?.avatar_url ? { images: [{ url: user.avatar_url, width: 400, height: 400, alt: name }] } : {}),
    },
    twitter: {
      card: 'summary',
      title: `${name} — Lokro`,
      description,
      ...(user?.avatar_url ? { images: [user.avatar_url] } : {}),
    },
  }
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
    id: string; name: string; email: string
    avatar_url: string | null; latitude: number | null; longitude: number | null
  }

  const specialties = provider.specialties as unknown as {
    category: { id: string; name: string; icon: string; color: string }
  }[]

  const portfolio = provider.portfolio as unknown as {
    id: string; image_url: string; created_at: string
  }[]

  const primaryCategoryName = specialties[0]?.category?.name
  const heroImage = CATEGORY_HERO[primaryCategoryName ?? ''] ?? DEFAULT_HERO

  return (
    <div className="min-h-screen bg-background">
      {/* Hero cover */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <Image
          src={heroImage}
          alt={primaryCategoryName ?? 'Profesional'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium bg-white/90 backdrop-blur rounded-xl px-3 py-2 hover:bg-white transition-all shadow-md"
          >
            <ArrowLeft size={15} />
            Explorar
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Profile header — overlaps the hero */}
        <div className="-mt-14 sm:-mt-16 pb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
            {/* Avatar with border */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-background shadow-xl bg-muted">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.name} fill className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background shadow ${provider.available ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            </div>

            <div className="flex-1 space-y-2 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <Badge variant={provider.available ? 'default' : 'secondary'} className="shrink-0">
                  {provider.available ? '● Disponible' : 'No disponible'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <strong className="text-foreground">{provider.average_rating.toFixed(1)}</strong>
                  <span>({provider.total_reviews} reseñas)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Desde {new Date(provider.created_at).getFullYear()}
                </span>
                {user.latitude && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    Colombia
                  </span>
                )}
                <span className="font-bold text-foreground text-base">
                  {formatCurrency(provider.hourly_rate)}/h
                </span>
              </div>

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {specialties.map(({ category }) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon} {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA desktop */}
            <div className="hidden sm:block shrink-0">
              <Button asChild size="lg" disabled={!provider.available}>
                <Link href={`/request/${id}`}>
                  Solicitar servicio
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid lg:grid-cols-3 gap-8 py-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Bio */}
            {provider.bio && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase size={18} className="text-primary" />
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
                    <div key={item.id} className="aspect-square rounded-2xl overflow-hidden bg-muted relative group">
                      <Image
                        src={item.image_url}
                        alt="Trabajo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Reseñas de clientes</h2>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{provider.average_rating.toFixed(1)}</span>
                  <span>· {provider.total_reviews} en total</span>
                </div>
              </div>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const author = review.author as unknown as { name: string; avatar_url: string | null }
                    return (
                      <div key={review.id} className="rounded-2xl border bg-card p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={author.name} avatarUrl={author.avatar_url} size="sm" />
                            <p className="text-sm font-medium">{author.name}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatRelativeTime(review.created_at)}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size={13} />
                        {review.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border bg-muted/30 p-8 text-center text-muted-foreground">
                  <Star size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aún no hay reseñas. ¡Sé el primero!</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 space-y-5 sticky top-24 shadow-sm">
              <div className="text-center py-2">
                <p className="text-4xl font-bold">{formatCurrency(provider.hourly_rate)}</p>
                <p className="text-sm text-muted-foreground mt-1">por hora · en COP</p>
              </div>

              <Button asChild size="lg" className="w-full" disabled={!provider.available}>
                <Link href={`/request/${id}`}>
                  {provider.available ? 'Reservar ahora' : 'No disponible'}
                  {provider.available && <ArrowRight size={16} className="ml-2" />}
                </Link>
              </Button>

              <Separator />

              <div className="space-y-2.5 text-sm">
                {[
                  'Pago seguro garantizado',
                  'Cancelación gratuita 24h antes',
                  'Comunicación directa',
                  'Soporte 7 días a la semana',
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

      {/* Mobile CTA bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t p-3 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-bold">{formatCurrency(provider.hourly_rate)}/h</p>
            <p className="text-xs text-muted-foreground">{user.name}</p>
          </div>
          <Button asChild disabled={!provider.available} className="flex-1 max-w-xs">
            <Link href={`/request/${id}`}>
              {provider.available ? 'Solicitar servicio' : 'No disponible'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
