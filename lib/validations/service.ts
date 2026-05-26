import { z } from 'zod'

export const serviceRequestSchema = z.object({
  provider_id: z.string().uuid(),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().min(20, 'Mínimo 20 caracteres').max(500),
  address: z.string().min(5, 'Dirección requerida'),
  latitude: z.number(),
  longitude: z.number(),
  requested_date: z.string().min(1, 'Selecciona fecha y hora'),
  estimated_price: z.number().min(0).optional(),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(300).optional(),
})

export const messageSchema = z.object({
  content: z.string().min(1).max(1000),
})

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type MessageInput = z.infer<typeof messageSchema>
