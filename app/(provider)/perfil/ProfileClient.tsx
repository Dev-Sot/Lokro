'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  User, FileText, DollarSign, MapPin, Tag,
  Camera, Save, Loader2, Images, Plus, X, AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar, uploadPortfolioImage, deletePortfolioImage } from '@/lib/services/storage'
import type { User as UserType, ProviderProfile, Category, ProviderSpecialty, ProviderPortfolio } from '@/types'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const MAX_PORTFOLIO = 6

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto').max(60, 'Nombre muy largo'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  hourly_rate: z.coerce.number().min(5000, 'Mínimo COP 5.000/hora'),
})
type FormData = z.infer<typeof schema>

interface Props {
  user: UserType
  profile: ProviderProfile
  categories: Category[]
  specialties: (ProviderSpecialty & { category: Category })[]
  portfolio: ProviderPortfolio[]
  onboarding?: boolean
}

export function ProfileClient({ user, profile, categories, specialties, portfolio: initialPortfolio, onboarding }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const [selected, setSelected] = useState(new Set(specialties.map((s) => s.category_id)))
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [uploading, setUploading] = useState(false)
  const [portfolioItems, setPortfolioItems] = useState<ProviderPortfolio[]>(initialPortfolio)
  const [portfolioUploading, setPortfolioUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    user.latitude && user.longitude ? { lat: user.latitude, lng: user.longitude } : null
  )
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const center: [number, number] = coords ? [coords.lng, coords.lat] : [-74.0721, 4.7110]

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: coords ? 13 : 5,
    })

    if (coords) {
      markerRef.current = new mapboxgl.Marker({ color: '#6366f1', draggable: true })
        .setLngLat([coords.lng, coords.lat])
        .addTo(mapRef.current)
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat()
        setCoords({ lat: lngLat.lat, lng: lngLat.lng })
      })
    }

    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setCoords({ lat, lng })
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#6366f1', draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!)
        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current!.getLngLat()
          setCoords({ lat: lngLat.lat, lng: lngLat.lng })
        })
      }
      toast.success('Ubicación seleccionada')
    })

    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: user.name,
      bio: profile.bio ?? '',
      hourly_rate: profile.hourly_rate,
    },
  })

  async function onSubmit(data: FormData) {
    const { error: e1 } = await supabase.from('users')
      .update({ name: data.name, latitude: coords?.lat ?? null, longitude: coords?.lng ?? null })
      .eq('id', user.id)
    if (e1) { toast.error('Error al guardar'); return }

    const { error: e2 } = await supabase.from('provider_profiles')
      .update({ bio: data.bio || null, hourly_rate: (data as any).hourly_rate })
      .eq('user_id', user.id)
    if (e2) { toast.error('Error al guardar perfil'); return }

    await supabase.from('provider_specialties').delete().eq('provider_id', profile.id)
    if (selected.size > 0) {
      await supabase.from('provider_specialties').insert(
        Array.from(selected).map((category_id) => ({ provider_id: profile.id, category_id }))
      )
    }
    toast.success('Perfil actualizado')
    if (onboarding) {
      router.push('/provider/dashboard')
    } else {
      router.refresh()
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return }
    setUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      await supabase.from('users').update({ avatar_url: url }).eq('id', user.id)
      setAvatarUrl(url)
      toast.success('Foto actualizada')
    } catch { toast.error('Error al subir la foto') }
    finally { setUploading(false); e.target.value = '' }
  }

  async function onPortfolioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (portfolioItems.length >= MAX_PORTFOLIO) {
      toast.error(`Máximo ${MAX_PORTFOLIO} imágenes`)
      return
    }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 MB'); return }
    setPortfolioUploading(true)
    try {
      const imageUrl = await uploadPortfolioImage(profile.id, file)
      const { data } = await supabase
        .from('provider_portfolio')
        .insert({ provider_id: profile.id, image_url: imageUrl })
        .select()
        .single()
      if (data) setPortfolioItems((prev) => [...prev, data])
      toast.success('Imagen añadida al portafolio')
    } catch { toast.error('Error al subir la imagen') }
    finally { setPortfolioUploading(false); e.target.value = '' }
  }

  async function deletePortfolioItem(item: ProviderPortfolio) {
    setDeletingId(item.id)
    try {
      // Extract storage path from public URL
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const prefix = `${supabaseUrl}/storage/v1/object/public/portfolios/`
      const storagePath = item.image_url.startsWith(prefix)
        ? item.image_url.slice(prefix.length)
        : null

      if (storagePath) await deletePortfolioImage(storagePath)

      await supabase.from('provider_portfolio').delete().eq('id', item.id)
      setPortfolioItems((prev) => prev.filter((p) => p.id !== item.id))
      toast.success('Imagen eliminada')
    } catch { toast.error('Error al eliminar la imagen') }
    finally { setDeletingId(null) }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {onboarding && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4 flex gap-3">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">¡Completa tu perfil!</p>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">
              Para aparecer en el mapa y recibir solicitudes de clientes, necesitas agregar tu
              <strong> ubicación</strong>, al menos una <strong>especialidad</strong> y una <strong>tarifa por hora</strong>.
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground mt-1">Completa tu perfil para aparecer en el mapa</p>
      </div>

      {/* Avatar */}
      <div className="rounded-xl border bg-card p-6 flex items-center gap-5">
        <div className="relative">
          <UserAvatar name={user.name} avatarUrl={avatarUrl} size="lg" />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </div>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WebP · Max 5 MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Basic info */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            <h2 className="font-semibold">Información básica</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" {...register('name')} placeholder="Tu nombre" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </section>

        {/* Bio */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h2 className="font-semibold">Descripción</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio profesional</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              rows={4}
              className="resize-none"
              placeholder="Cuéntales a los clientes sobre tu experiencia..."
            />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>
        </section>

        {/* Hourly rate */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            <h2 className="font-semibold">Tarifa</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hourly_rate">Tarifa por hora (COP)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                id="hourly_rate"
                type="number"
                min={5000}
                step={1000}
                className="pl-7"
                {...register('hourly_rate')}
                placeholder="50000"
              />
            </div>
            {errors.hourly_rate && (
              <p className="text-xs text-destructive">{errors.hourly_rate.message}</p>
            )}
          </div>
        </section>

        {/* Location */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <h2 className="font-semibold">Ubicación</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Haz clic en el mapa para marcar dónde ofreces tu servicio. Puedes arrastrar el pin para ajustar.
          </p>
          <div ref={mapContainerRef} className="h-64 w-full rounded-xl overflow-hidden border" />
          {coords ? (
            <p className="text-xs text-green-600 font-medium">
              ✓ Ubicación guardada: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          ) : (
            <p className="text-xs text-amber-600">Haz clic en el mapa para seleccionar tu ubicación</p>
          )}
        </section>

        {/* Specialties */}
        {categories.length > 0 && (
          <section className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-primary" />
              <h2 className="font-semibold">Especialidades</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">Selecciona los servicios que ofreces</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected.has(cat.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                  }`}
                >
                  <span>{cat.icon}</span>{cat.name}
                </button>
              ))}
            </div>
            {selected.size === 0 && (
              <p className="text-xs text-amber-600">Selecciona al menos una especialidad</p>
            )}
          </section>
        )}

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar cambios
        </Button>
      </form>

      {/* Portfolio — outside the main form to avoid nested form issues */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images size={16} className="text-primary" />
            <h2 className="font-semibold">Portafolio</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {portfolioItems.length}/{MAX_PORTFOLIO}
          </span>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Muestra fotos de tu trabajo para generar más confianza
        </p>

        <div className="grid grid-cols-3 gap-3">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
            >
              <Image
                src={item.image_url}
                alt="Portafolio"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <button
                type="button"
                onClick={() => deletePortfolioItem(item)}
                disabled={deletingId === item.id}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive disabled:opacity-50"
              >
                {deletingId === item.id
                  ? <Loader2 size={11} className="animate-spin" />
                  : <X size={11} />
                }
              </button>
            </div>
          ))}

          {portfolioItems.length < MAX_PORTFOLIO && (
            <button
              type="button"
              onClick={() => portfolioInputRef.current?.click()}
              disabled={portfolioUploading}
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              {portfolioUploading
                ? <Loader2 size={20} className="animate-spin" />
                : <Plus size={20} />
              }
              <span className="text-xs font-medium">Añadir</span>
            </button>
          )}
        </div>

        <input
          ref={portfolioInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onPortfolioChange}
        />
        <p className="text-xs text-muted-foreground">JPG, PNG o WebP · Max 5 MB por imagen</p>
      </section>
    </div>
  )
}