import Link from 'next/link'
import { MapPin, Star, Clock } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDistance } from '@/lib/utils'
import type { ProviderMapMarker } from '@/types'

interface ProviderCardProps {
  provider: ProviderMapMarker
  distanceMeters?: number
  selected?: boolean
  onClick?: () => void
  compact?: boolean
}

export function ProviderCard({
  provider,
  distanceMeters,
  selected,
  onClick,
  compact = false,
}: ProviderCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border bg-card p-4 cursor-pointer transition-all',
        selected ? 'border-primary ring-1 ring-primary shadow-md' : 'hover:border-muted-foreground/30 hover:shadow-sm',
        compact && 'p-3'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <UserAvatar
            name={provider.name}
            avatarUrl={provider.avatar_url}
            size={compact ? 'sm' : 'md'}
          />
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
              provider.available ? 'bg-green-500' : 'bg-muted-foreground'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm truncate">{provider.name}</p>
              {provider.specialties.length > 0 && (
                <p className="text-xs text-muted-foreground truncate">
                  {provider.specialties[0]}
                </p>
              )}
            </div>
            <Badge
              variant={provider.available ? 'default' : 'secondary'}
              className="shrink-0 text-[10px] px-1.5 py-0"
            >
              {provider.available ? 'Disponible' : 'Ocupado'}
            </Badge>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              {provider.average_rating.toFixed(1)}
            </span>
            <span className="font-medium text-foreground">
              {formatCurrency(provider.hourly_rate)}/h
            </span>
            {distanceMeters !== undefined && (
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {formatDistance(distanceMeters)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <Button asChild size="sm" className="w-full mt-3">
          <Link href={`/providers/${provider.id}`}>Ver perfil</Link>
        </Button>
      )}
    </div>
  )
}
