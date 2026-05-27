'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { serviceRequestSchema, type ServiceRequestInput } from '@/lib/validations/service'
import { formatCurrency } from '@/lib/utils'
import type { ProviderProfile, Category } from '@/types'

interface RequestFormProps {
  provider: ProviderProfile & {
    user: { id: string; name: string }
    specialties: { category: Category }[]
  }
  currentUserId: string
}

export function RequestForm({ provider, currentUserId }: RequestFormProps) {
  const router = useRouter()
  const [locating, setLocating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestInput>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      provider_id: provider.id,
      latitude: 0,
      longitude: 0,
    },
  })

  const estimatedPrice = watch('estimated_price')

  async function detectLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude)
        setValue('longitude', pos.coords.longitude)
        setLocating(false)
        toast.success('Ubicación detectada')
      },
      () => {
        setLocating(false)
        toast.error('No se pudo detectar la ubicación')
      }
    )
  }

  async function onSubmit(data: ServiceRequestInput) {
    const supabase = createClient()

    const { data: request, error } = await supabase
      .from('service_requests')
      .insert({
        user_id: currentUserId,
        provider_id: data.provider_id,
        category_id: data.category_id,
        description: data.description,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        requested_date: new Date(data.requested_date).toISOString(),
        status: 'PENDING',
        estimated_price: data.estimated_price || null,
      })
      .select('id')
      .single()

    if (error) {
      toast.error('Error al crear la solicitud. Intenta de nuevo.')
      return
    }

    // Add initial status history
    await supabase.from('service_status_history').insert({
      request_id: request.id,
      status: 'PENDING',
      created_by: currentUserId,
    })

    // Notificar al proveedor
    await supabase.from('notifications').insert({
      user_id: provider.user.id,
      title: '📋 Nueva solicitud de servicio',
      message: `Tienes una nueva solicitud: ${data.description.slice(0, 80)}${data.description.length > 80 ? '...' : ''}`,
      type: 'NEW_REQUEST',
      read: false,
    })

    toast.success('¡Solicitud enviada! El prestador te responderá pronto.')
    router.push(`/chat/${request.id}`)
  }

  const categories = provider.specialties.map((s) => s.category).filter((c): c is Category => c != null)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('provider_id')} />
      <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
      <input type="hidden" {...register('longitude', { valueAsNumber: true })} />

      <div className="space-y-1.5">
        <Label>Categoría del servicio</Label>
        <Select onValueChange={(v) => setValue('category_id', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category_id && (
          <p className="text-xs text-destructive">{errors.category_id.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción del trabajo</Label>
        <Textarea
          id="description"
          placeholder="Describe lo que necesitas con el mayor detalle posible..."
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Dirección</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            placeholder="Calle, número, ciudad..."
            className="flex-1"
            {...register('address')}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={detectLocation}
            disabled={locating}
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
          </Button>
        </div>
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="requested_date">Fecha y hora preferida</Label>
        <Input
          id="requested_date"
          type="datetime-local"
          min={new Date().toISOString().slice(0, 16)}
          {...register('requested_date')}
        />
        {errors.requested_date && (
          <p className="text-xs text-destructive">{errors.requested_date.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="estimated_price">Presupuesto estimado en COP (opcional)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id="estimated_price"
            type="number"
            min={0}
            step={1000}
            placeholder="50000"
            className="pl-7"
            {...register('estimated_price', { valueAsNumber: true })}
          />
        </div>
        {estimatedPrice && (
          <p className="text-xs text-muted-foreground">
            La plataforma retiene el 10% ({formatCurrency(estimatedPrice * 0.1)}) de comisión
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar solicitud
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          El prestador tiene 24h para aceptar o rechazar tu solicitud
        </p>
      </div>
    </form>
  )
}
