import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href={`/providers/${providerId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Ver perfil completo
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Solicitar servicio</h1>
        <p className="text-muted-foreground mt-1">Completa los detalles para enviar tu solicitud</p>
      </div>

      {/* Provider summary */}
      <div className="rounded-xl border p-4 flex items-center gap-4">
        <UserAvatar name={user.name} avatarUrl={user.avatar_url} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{user.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarRating rating={provider.average_rating} size={12} />
            <span>·</span>
            <span className="font-medium text-foreground">{formatCurrency(provider.hourly_rate)}/h</span>
          </div>
        </div>
        <Badge variant="default">Disponible</Badge>
      </div>

      <RequestForm
        provider={provider as unknown as Parameters<typeof RequestForm>[0]['provider']}
        currentUserId={authUser.id}
      />
    </div>
  )
}
