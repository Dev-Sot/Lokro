'use client'

import { useEffect, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: 'Geolocalización no soportada',
        loading: false,
      }))
      return
    }

    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setState({
          latitude: coords.latitude,
          longitude: coords.longitude,
          error: null,
          loading: false,
        })
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, loading: false }))
      },
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return state
}
