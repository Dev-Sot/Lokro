'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { PROVIDER_LOCATION_UPDATE_INTERVAL } from '@/constants'
import { formatRelativeTime } from '@/lib/utils'
import { CheckCircle2, Circle, Navigation, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ServiceRequest, ServiceStatusHistory, User } from '@/types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface TrackingClientProps {
  request: ServiceRequest
  statusHistory: ServiceStatusHistory[]
  currentUserId: string
  isProvider: boolean
}

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] as const

export function TrackingClient({
  request,
  statusHistory,
  currentUserId,
  isProvider,
}: TrackingClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [providerLocation, setProviderLocation] = useState<{
    latitude: number; longitude: number
  } | null>(null)

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [request.longitude, request.latitude],
      zoom: 14,
    })

    // User location marker
    new mapboxgl.Marker({ color: '#6366f1' })
      .setLngLat([request.longitude, request.latitude])
      .setPopup(new mapboxgl.Popup().setText('Tu ubicación'))
      .addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Subscribe to provider location updates
  useEffect(() => {
    const supabase = createClient()

    async function fetchProviderLocation() {
      const { data } = await supabase
        .from('provider_locations')
        .select('latitude, longitude')
        .eq('provider_id', request.provider_id)
        .single()

      if (data) setProviderLocation(data)
    }

    fetchProviderLocation()

    const channel = supabase
      .channel(`tracking:${request.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'provider_locations',
        filter: `provider_id=eq.${request.provider_id}`,
      }, (payload) => {
        const loc = payload.new as { latitude: number; longitude: number }
        setProviderLocation(loc)
      })
      .subscribe()

    // If provider, broadcast own location
    let locationInterval: ReturnType<typeof setInterval> | null = null
    let cleanedUp = false

    if (isProvider && request.status === 'IN_PROGRESS') {
      locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (cleanedUp) return
            const { error } = await supabase
              .from('provider_locations')
              .upsert({
                provider_id: request.provider_id,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                updated_at: new Date().toISOString(),
              })
            if (error) console.error('TrackingClient: location upsert failed', error)
          },
          (err) => {
            console.error('TrackingClient: geolocation error', err.message)
            if (err.code === err.PERMISSION_DENIED && locationInterval) {
              clearInterval(locationInterval)
              locationInterval = null
            }
          }
        )
      }, PROVIDER_LOCATION_UPDATE_INTERVAL)
    }

    return () => {
      cleanedUp = true
      supabase.removeChannel(channel)
      if (locationInterval) clearInterval(locationInterval)
    }
  }, [request.id, request.provider_id, request.status, isProvider])

  // Update provider marker on map
  useEffect(() => {
    if (!mapRef.current || !providerLocation) return

    if (markerRef.current) {
      markerRef.current.setLngLat([providerLocation.longitude, providerLocation.latitude])
    } else {
      const el = document.createElement('div')
      el.innerHTML = `<div class="h-10 w-10 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold">P</div>`
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([providerLocation.longitude, providerLocation.latitude])
        .setPopup(new mapboxgl.Popup().setText('Tu prestador'))
        .addTo(mapRef.current)
    }

    // Fit bounds to show both user and provider
    const bounds = new mapboxgl.LngLatBounds()
    bounds.extend([request.longitude, request.latitude])
    bounds.extend([providerLocation.longitude, providerLocation.latitude])
    mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 16 })
  }, [providerLocation])

  const providerUser = (request.provider as { user: User } | null)?.user

  const currentStep = STATUS_STEPS.indexOf(request.status as typeof STATUS_STEPS[number])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href={`/chat/${request.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al chat
        </Link>
        <div className="ml-auto">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/chat/${request.id}`}>
              <MessageCircle size={15} />
              Abrir chat
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Seguimiento en tiempo real</h1>
        <div className="flex items-center gap-3 mt-1">
          <StatusBadge status={request.status} />
          {providerUser && (
            <div className="flex items-center gap-2">
              <UserAvatar name={providerUser.name} avatarUrl={providerUser.avatar_url} size="sm" />
              <span className="text-sm text-muted-foreground">{providerUser.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 h-80 lg:h-[480px]">
          <div
            ref={mapContainerRef}
            className="h-full w-full rounded-xl overflow-hidden border"
          />
          {!providerLocation && request.status === 'IN_PROGRESS' && (
            <p className="text-xs text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <Navigation size={12} className="animate-pulse" />
              Esperando ubicación del prestador...
            </p>
          )}
        </div>

        {/* Status timeline */}
        <div className="space-y-4">
          <h2 className="font-semibold">Estado del servicio</h2>

          <div className="space-y-1">
            {STATUS_STEPS.map((step, index) => {
              const isDone = index <= currentStep
              const isCurrent = index === currentStep
              const historyEntry = statusHistory.find((h) => h.status === step)

              return (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          index < currentStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-sm font-medium ${
                        isDone ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {{
                        PENDING: 'Solicitud enviada',
                        ACCEPTED: 'Solicitud aceptada',
                        IN_PROGRESS: 'En camino',
                        COMPLETED: 'Completado',
                      }[step]}
                    </p>
                    {historyEntry && (
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(historyEntry.created_at)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl border p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Descripción</p>
            <p className="text-sm">{request.description}</p>
            <p className="text-xs text-muted-foreground">{request.address}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
