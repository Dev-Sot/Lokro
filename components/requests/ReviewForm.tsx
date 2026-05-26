'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  requestId: string
  authorId: string
  targetId: string
  type: 'TO_PROVIDER' | 'TO_USER'
  targetName: string
  onComplete?: () => void
}

export function ReviewForm({
  requestId,
  authorId,
  targetId,
  type,
  targetName,
  onComplete,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    if (rating === 0) {
      toast.error('Selecciona una calificación')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('reviews').insert({
      request_id: requestId,
      author_id: authorId,
      target_id: targetId,
      rating,
      comment: comment.trim() || null,
      type,
    })

    if (error) {
      if (error.code === '23505') {
        toast.info('Ya enviaste una reseña para este servicio')
      } else {
        toast.error('Error al enviar la reseña')
      }
    } else {
      toast.success('¡Reseña enviada!')
      onComplete?.()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border p-5 space-y-4">
      <div>
        <p className="font-semibold">Califica tu experiencia</p>
        <p className="text-sm text-muted-foreground">con {targetName}</p>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1"
          >
            <Star
              size={28}
              className={cn(
                'transition-colors',
                (hovered || rating) >= star
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label>Comentario (opcional)</Label>
        <Textarea
          placeholder="Cuéntanos cómo fue tu experiencia..."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length}/300</p>
      </div>

      <Button onClick={submit} disabled={loading || rating === 0} className="w-full">
        Enviar reseña
      </Button>
    </div>
  )
}
