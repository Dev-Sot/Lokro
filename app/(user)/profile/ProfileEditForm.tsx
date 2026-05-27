'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Pencil, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar } from '@/lib/services/storage'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
})
type FormData = z.infer<typeof schema>

interface Props {
  userId: string
  currentName: string
  currentAvatarUrl: string | null
}

export function ProfileEditForm({ userId, currentName, currentAvatarUrl }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
  })

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadAvatar(userId, file)
      const supabase = createClient()
      const { error } = await supabase.from('users').update({ avatar_url: url }).eq('id', userId)
      if (error) throw error
      setAvatarUrl(url)
      toast.success('Foto actualizada')
      router.refresh()
    } catch {
      toast.error('Error al subir la foto')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormData) {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ name: data.name })
      .eq('id', userId)

    if (error) {
      toast.error('Error al guardar los cambios')
      return
    }

    toast.success('Perfil actualizado')
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Pencil size={14} />
        Editar perfil
      </Button>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Editar perfil</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <UserAvatar name={currentName} avatarUrl={avatarUrl} size="lg" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90 transition-colors"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="text-xs text-muted-foreground">Haz clic en el ícono para cambiar tu foto</p>
      </div>

      {/* Name */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 size={14} className="mr-2 animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </div>
  )
}
