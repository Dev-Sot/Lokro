'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProviderCard } from '@/components/providers/ProviderCard'
import { ProviderFilters } from '@/components/providers/ProviderFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { useMapStore } from '@/store/useMapStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { createClient } from '@/lib/supabase/client'
import { getDistanceInMeters } from '@/lib/utils'
import type { ProviderMapMarker } from '@/types'

const ProviderMap = dynamic(
  () => import('@/components/map/ProviderMap').then((m) => m.ProviderMap),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> }
)

export function HomeClient() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { markers, setMarkers, selectedMarkerId, setSelectedMarkerId, filters, setUserLocation, userLocation } =
    useMapStore()
  const geo = useGeolocation()

  // Update user location in store
  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      setUserLocation({ lat: geo.latitude, lng: geo.longitude })
    }
  }, [geo.latitude, geo.longitude, setUserLocation])

  // Fetch providers with realtime subscription
  useEffect(() => {
    const supabase = createClient()

    async function fetchProviders() {
      const { data } = await supabase
        .from('provider_profiles')
        .select(`
          id,
          hourly_rate,
          available,
          average_rating,
          user:users(id, name, avatar_url, latitude, longitude),
          specialties:provider_specialties(category:categories(name))
        `)

      if (!data) return

      const mapped: ProviderMapMarker[] = data
        .filter((p) => p.user && (p.user as unknown as { latitude?: number }).latitude)
        .map((p) => {
          const user = p.user as unknown as { id: string; name: string; avatar_url: string | null; latitude: number; longitude: number }
          const specialties = (p.specialties as unknown as { category: { name: string } }[]).map((s) => s.category.name)
          return {
            id: p.id,
            user_id: user.id,
            name: user.name,
            avatar_url: user.avatar_url,
            latitude: user.latitude,
            longitude: user.longitude,
            available: p.available,
            average_rating: p.average_rating,
            hourly_rate: p.hourly_rate,
            specialties,
          }
        })

      setMarkers(mapped)
      setLoading(false)
    }

    fetchProviders()

    // Realtime subscription for provider availability changes
    const channel = supabase
      .channel('providers-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'provider_profiles' },
        () => fetchProviders()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'provider_locations' },
        () => fetchProviders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setMarkers])

  // Apply filters + search
  const filteredProviders = useMemo(() => {
    return markers.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()))) {
        return false
      }
      if (filters.category && !p.specialties.includes(filters.category)) return false
      if (filters.minRating && p.average_rating < filters.minRating) return false
      if (filters.maxPrice && p.hourly_rate / 100 > filters.maxPrice) return false
      if (filters.maxDistance && userLocation) {
        const d = getDistanceInMeters(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
        if (d / 1000 > filters.maxDistance) return false
      }
      return true
    })
  }, [markers, search, filters, userLocation])

  const selectedProvider = useMemo(
    () => filteredProviders.find((p) => p.id === selectedMarkerId) ?? null,
    [filteredProviders, selectedMarkerId]
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-80 lg:w-96 shrink-0 border-r overflow-hidden">
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar profesionales…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredProviders.length} profesionales
            </p>
            <ProviderFilters />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            : filteredProviders.length === 0
              ? (
                <div className="text-center py-12 text-muted-foreground">
                  <SlidersHorizontal size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Sin resultados con estos filtros</p>
                </div>
              )
              : filteredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    selected={provider.id === selectedMarkerId}
                    distanceMeters={
                      userLocation
                        ? getDistanceInMeters(
                            userLocation.lat,
                            userLocation.lng,
                            provider.latitude,
                            provider.longitude
                          )
                        : undefined
                    }
                    onClick={() =>
                      setSelectedMarkerId(
                        selectedMarkerId === provider.id ? null : provider.id
                      )
                    }
                  />
                ))}
        </div>
      </aside>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-4 z-10">
          {/* Mobile search bar over map */}
          <div className="md:hidden flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar…"
                className="pl-9 bg-background shadow-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ProviderFilters />
          </div>
        </div>

        <ProviderMap
          providers={filteredProviders}
          onProviderSelect={(id) =>
            setSelectedMarkerId(selectedMarkerId === id ? null : id)
          }
        />

        {/* Selected provider floating card (mobile) */}
        {selectedProvider && (
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
            <ProviderCard
              provider={selectedProvider}
              distanceMeters={
                userLocation
                  ? getDistanceInMeters(
                      userLocation.lat,
                      userLocation.lng,
                      selectedProvider.latitude,
                      selectedProvider.longitude
                    )
                  : undefined
              }
              selected
            />
          </div>
        )}
      </div>
    </div>
  )
}
