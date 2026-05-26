'use client'

import { create } from 'zustand'
import type { ProviderMapMarker, ProviderFilters } from '@/types'

interface MapState {
  markers: ProviderMapMarker[]
  setMarkers: (markers: ProviderMapMarker[]) => void
  selectedMarkerId: string | null
  setSelectedMarkerId: (id: string | null) => void
  filters: ProviderFilters
  setFilters: (filters: Partial<ProviderFilters>) => void
  userLocation: { lat: number; lng: number } | null
  setUserLocation: (loc: { lat: number; lng: number } | null) => void
}

export const useMapStore = create<MapState>((set) => ({
  markers: [],
  setMarkers: (markers) => set({ markers }),
  selectedMarkerId: null,
  setSelectedMarkerId: (id) => set({ selectedMarkerId: id }),
  filters: {},
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),
}))
