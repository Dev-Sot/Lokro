import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Star, Clock, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { StarRating } from '@/components/shared/StarRating'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { RequestForm } from './RequestForm'

interface Props {
  params: Promise<{ providerId: string }>
}

export const metadata: Metadata = { title: 'Solicitar servicio' }

export default async function RequestPage({ params }: Props) {
  const { providerId } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      id, bio, hourly_rate, available, average_rating, total_reviews,
      user:users(id, name, avatar_url),
      specialties:provider_specialties(category:categories(id, name, icon, color))
    `)
    .eq('id', providerId)
    .single()

  if (!provider) notFound()
  if (!provider.available) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-xl font-semibold">Prestador no disponible</p>
        <p className="text-muted-foreground">Este profesional no está disponible en este momento.</p>
        <Link href="/home" className="text-primary hover:underline">Volver al mapa</Link>
      </div>
    )
  }

  const user = provider.user as unknown as { id: string; name: string; avatar_url: string | null }

  const specialties = provider.specialties as unknown as { category: { name: string; icon: string; color: string } }[]

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link
          href={`/providers/${providerId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Ver perfil completo
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Solicitar servicio</h1>
          <p className="text-muted-foreground mt-1">Completa los detalles para enviar tu solicitud</p>
        </div>

        {/* Provider summary card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
          <div className="p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="lg" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{user.name}</p>
                <Badge variant="default" className="text-xs">Disponible</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {provider.average_rating.toFixed(1)} ({provider.total_reviews})
                </span>
                <span className="font-semibold text-foreground">{formatCurrency(provider.hourly_rate)}/h</span>
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {specialties.slice(0, 3).map(({ category: cat }) => (
                    <span
                      key={cat.name}
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                    >
                      {cat.icon} {cat.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="border-t px-4 py-3 bg-muted/20 grid grid-cols-3 gap-2">
            {[
              { icon: Shield, label: 'Pago seguro' },
              { icon: Clock,  label: 'Respuesta 24h' },
              { icon: Star,   label: 'Calidad verificada' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon size={12} className="text-primary shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-6">
          <RequestForm
            provider={provider as unknown as Parameters<typeof RequestForm>[0]['provider']}
            currentUserId={authUser.id}
          />
        </div>
      </div>
    </div>
  )
}
