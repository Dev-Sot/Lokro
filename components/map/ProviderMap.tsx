'use client'

import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useMapStore } from '@/store/useMapStore'
import type { ProviderMapMarker } from '@/types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface ProviderMapProps {
  providers: ProviderMapMarker[]
  onProviderSelect: (id: string) => void
}

export function ProviderMap({ providers, onProviderSelect }: ProviderMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const { selectedMarkerId, userLocation } = useMapStore()

  const buildPopupHTML = useCallback((p: ProviderMapMarker) => `
    <div class="p-1 space-y-1 min-w-[160px]">
      <p class="font-semibold text-sm">${p.name}</p>
      <p class="text-xs text-gray-500">${p.specialties[0] ?? 'Servicio'}</p>
      <div class="flex items-center gap-1 text-xs">
        <span class="text-amber-500">★</span>
        <span>${p.average_rating.toFixed(1)}</span>
        <span class="text-gray-400">•</span>
        <span class="font-medium">$${(p.hourly_rate / 100).toFixed(0)}/h</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <span class="h-2 w-2 rounded-full ${p.available ? 'bg-green-500' : 'bg-gray-400'}"></span>
        <span>${p.available ? 'Disponible' : 'No disponible'}</span>
      </div>
    </div>
  `, [])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation
        ? [userLocation.lng, userLocation.lat]
        : [-3.7038, 40.4168],
      zoom: 13,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      'top-right'
    )

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Add/update markers when providers change
  useEffect(() => {
    if (!mapRef.current) return

    const currentIds = new Set(providers.map((p) => p.id))

    // Remove stale markers
    for (const [id, marker] of markersRef.current) {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    }

    // Add/update markers
    providers.forEach((provider) => {
      if (markersRef.current.has(provider.id)) return

      const el = document.createElement('div')
      el.className = 'provider-marker'
      el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="h-10 w-10 rounded-full border-2 ${
            provider.available ? 'border-green-500' : 'border-gray-400'
          } bg-white shadow-lg overflow-hidden flex items-center justify-center text-sm font-bold text-gray-700 hover:scale-110 transition-transform">
            ${provider.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          ${provider.available ? '<span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>' : ''}
        </div>
      `

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(buildPopupHTML(provider))

      const marker = new mapboxgl.Marker(el)
        .setLngLat([provider.longitude, provider.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!)

      el.addEventListener('click', () => onProviderSelect(provider.id))
      markersRef.current.set(provider.id, marker)
    })
  }, [providers, onProviderSelect, buildPopupHTML])

  // Highlight selected marker
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()
      const inner = el.querySelector('div > div') as HTMLElement | null
      if (!inner) return
      if (id === selectedMarkerId) {
        inner.style.transform = 'scale(1.25)'
        inner.style.borderColor = 'var(--color-primary, #6366f1)'
        marker.getPopup()?.addTo(mapRef.current!)
      } else {
        inner.style.transform = ''
        inner.style.borderColor = ''
      }
    })
  }, [selectedMarkerId])

  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-xl overflow-hidden" />
  )
}
