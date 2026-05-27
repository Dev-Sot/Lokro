'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, FileText, DollarSign, MapPin, Tag, Camera, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar } from '@/lib/services/storage'
import type { User as UserType, ProviderProfile, Category, ProviderSpecialty } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto').max(60, 'Nombre muy largo'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  hourly_rate: z.coerce.number().min(1, 'Ingresa una tarifa válida'),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface Props {
  user: UserType
  profile: ProviderProfile
  categories: Category[]
  specialties: (ProviderSpecialty & { category: Category })[]
}

export function ProfileClient({ user, profile, categories, specialties }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState(new Set(specialties.map((s) => s.category_id)))
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      bio: profile.bio ?? '',
      hourly_rate: Math.round(profile.hourly_rate / 100),
      latitude: user.latitude ?? '',
      longitude: user.longitude ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    const { error: e1 } = await supabase.from('users')
      .update({ name: data.name, latitude: data.latitude || null, longitude: data.longitude || null })
      .eq('id', user.id)
    if (e1) { toast.error('Error al guardar'); return }

    const { error: e2 } = await supabase.from('provider_profiles')
      .update({ bio: data.bio || null, hourly_rate: data.hourly_rate * 100 })
      .eq('user_id', user.id)
    if (e2) { toast.error('Error al guardar perfil'); return }

    await supabase.from('provider_specialties').delete().eq('provider_id', profile.id)
    if (selected.size > 0) {
      await supabase.from('provider_specialties').insert(
        Array.from(selected).map((category_id) => ({ provider_id: profile.id, category_id }))
      )
    }
    toast.success('Perfil actualizado')
    router.refresh()
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
      router.refresh()
    } catch { toast.error('Error al subir la foto') }
    finally { setUploading(false) }
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
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground mt-1">Completa tu perfil para aparecer en el mapa</p>
      </div>

      <div className="rounded-xl border bg-card p-6 flex items-center gap-5">
        <div className="relative">
          <UserAvatar name={user.name} avatarUrl={avatarUrl} size="lg" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
        </div>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WebP · Max 5 MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            <h2 className="font-semibold">Informacion basica</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" {...register('name')} placeholder="Tu nombre" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <h2 className="font-semibold">Descripcion</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio profesional</Label>
            <Textarea id="bio" {...register('bio')} rows={4} className="resize-none"
              placeholder="Cuentales a los clientes sobre tu experiencia..." />
            {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            <h2 className="font-semibold">Tarifa</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hourly_rate">Tarifa por hora (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input id="hourly_rate" type="number" min={1} className="pl-7"
                {...register('hourly_rate')} placeholder="50" />
            </div>
            {errors.hourly_rate && <p className="text-xs text-destructive">{errors.hourly_rate.message}</p>}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <h2 className="font-semibold">Ubicacion</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Tu ubicacion aparecera en el mapa.{' '}
            <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline">
              Busca tus coordenadas aqui
            </a>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">Latitud</Label>
              <Input id="latitude" type="number" step="any" {...register('latitude')} placeholder="4.7110" />
              {errors.latitude && <p className="text-xs text-destructive">{errors.latitude.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">Longitud</Label>
              <Input id="longitude" type="number" step="any" {...register('longitude')} placeholder="-74.0721" />
              {errors.longitude && <p className="text-xs text-destructive">{errors.longitude.message}</p>}
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-primary" />
              <h2 className="font-semibold">Especialidades</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">Selecciona los servicios que ofreces</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => toggle(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected.has(cat.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground'
                  }`}>
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
    </div>
  )
}
