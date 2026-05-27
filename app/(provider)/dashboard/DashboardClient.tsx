'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import {
  CheckCircle2,
  XCircle,
  DollarSign,
  Star,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import { StarRating } from '@/components/shared/StarRating'
import type { ServiceRequest, ProviderProfile } from '@/types'

export interface ReviewItem {
  id: string
  rating: number
  comment: string | null
  created_at: string
  author: { name: string; avatar_url: string | null } | null
}

interface DashboardClientProps {
  initialProfile: ProviderProfile
  userId: string
  reviews: ReviewItem[]
}

export function DashboardClient({ initialProfile, userId, reviews }: DashboardClientProps) {
  const [available, setAvailable] = useState(initialProfile.available)
  const [updating, setUpdating] = useState(false)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  async function toggleAvailability(v: boolean) {
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('provider_profiles')
      .update({ available: v })
      .eq('user_id', userId)

    if (error) {
      toast.error('No se pudo actualizar la disponibilidad')
    } else {
      setAvailable(v)
      toast.success(v ? 'Ahora apareces como disponible' : 'Ahora apareces como no disponible')
    }
    setUpdating(false)
  }

  useEffect(() => {
    const supabase = createClient()

    async function fetchRequests() {
      const { data } = await supabase
        .from('service_requests')
        .select(`
          id, description, status, estimated_price, created_at, requested_date,
          user:users(name, avatar_url),
          category:categories(name, icon)
        `)
        .eq('provider_id', initialProfile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setRequests((data ?? []) as unknown as ServiceRequest[])
      setLoading(false)
    }

    fetchRequests()

    const channel = supabase
      .channel('dashboard-requests')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'service_requests',
        filter: `provider_id=eq.${initialProfile.id}`,
      }, () => {
        fetchRequests()
        toast.info('Nueva solicitud recibida')
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'service_requests',
        filter: `provider_id=eq.${initialProfile.id}`,
      }, () => fetchRequests())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [initialProfile.id])

  async function updateRequestStatus(
    requestId: string,
    status: 'ACCEPTED' | 'CANCELLED'
  ) {
    const supabase = createClient()
    const { error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', requestId)

    if (!error) {
      await supabase.from('service_status_history').insert({
        request_id: requestId,
        status,
        created_by: userId,
      })
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      )
      toast.success(status === 'ACCEPTED' ? 'Solicitud aceptada' : 'Solicitud rechazada')
    }
  }

  const pending = requests.filter((r) => r.status === 'PENDING')
  const active = requests.filter((r) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)
  )
  const completed = requests.filter((r) => r.status === 'COMPLETED')
  const totalEarnings = completed.reduce(
    (sum, r) => sum + (r.final_price ?? r.estimated_price ?? 0),
    0
  )

  const stats = [
    { label: 'Pendientes', value: pending.length, icon: ClipboardList, color: 'text-amber-500' },
    { label: 'Activos', value: active.length, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Completados', value: completed.length, icon: CheckCircle2, color: 'text-green-500' },
    {
      label: 'Ingresos (mes)',
      value: formatCurrency(totalEarnings * 0.9),
      icon: DollarSign,
      color: 'text-primary',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Panel de control</h1>
          <p className="text-muted-foreground">Gestiona tus solicitudes y disponibilidad</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <div
            className={`h-3 w-3 rounded-full ${available ? 'bg-green-500' : 'bg-muted-foreground'} animate-pulse`}
          />
          <Label htmlFor="availability" className="cursor-pointer text-sm font-medium">
            {available ? 'Disponible' : 'No disponible'}
          </Label>
          <Switch
            id="availability"
            checked={available}
            onCheckedChange={toggleAvailability}
            disabled={updating}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Star size={20} className="text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-lg leading-none">{initialProfile.average_rating.toFixed(1)} <span className="text-muted-foreground font-normal text-sm">/ 5</span></p>
            <p className="text-sm text-muted-foreground">{initialProfile.total_reviews} reseña{initialProfile.total_reviews !== 1 ? 's' : ''} de clientes</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-8 text-center text-muted-foreground">
            <Star size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aún no tienes reseñas. ¡Completa servicios para recibir calificaciones!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border bg-card p-4 space-y-2">
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
                <StarRating rating={review.rating} size={13} />
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">
            Solicitudes pendientes ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((req) => {
              const user = req.user as { name: string; avatar_url: string | null } | undefined
              const category = req.category as { name: string; icon: string } | undefined
              return (
                <div key={req.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={user?.name ?? '?'}
                      avatarUrl={user?.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{user?.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(req.created_at)}
                        </span>
                      </div>
                      {category && (
                        <p className="text-xs text-muted-foreground">
                          {category.icon} {category.name}
                        </p>
                      )}
                      <p className="text-sm mt-1.5 line-clamp-2">{req.description}</p>
                      {req.estimated_price && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Presupuesto: {formatCurrency(req.estimated_price)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => updateRequestStatus(req.id, 'ACCEPTED')}
                    >
                      <CheckCircle2 size={14} />
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-destructive"
                      onClick={() => updateRequestStatus(req.id, 'CANCELLED')}
                    >
                      <XCircle size={14} />
                      Rechazar
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/chat/${req.id}`}>Chat</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Active requests */}
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">En progreso ({active.length})</h2>
          <div className="space-y-2">
            {active.map((req) => {
              const user = req.user as { name: string; avatar_url: string | null } | undefined
              const category = req.category as { name: string; icon: string } | undefined
              return (
                <div
                  key={req.id}
                  className="rounded-xl border bg-card p-4 flex items-center gap-3"
                >
                  <UserAvatar name={user?.name ?? '?'} avatarUrl={user?.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category?.icon} {category?.name} · {formatRelativeTime(req.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/chat/${req.id}`}>Chat</Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!loading && requests.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Sin solicitudes todavía</p>
          <p className="text-sm">Cuando los clientes te contacten, aparecerán aquí.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  )
}
