import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: number
  className?: string
  showValue?: boolean
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  className,
  showValue = false,
}: StarRatingProps) {
  return (
    <span className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground'
          }
        />
      ))}
      {showValue && (
        <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
      )}
    </span>
  )
}
