import { Badge } from '@/components/ui/badge'
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS } from '@/constants'
import type { ServiceRequestStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ServiceRequestStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        SERVICE_STATUS_COLORS[status],
        className
      )}
    >
      {SERVICE_STATUS_LABELS[status]}
    </span>
  )
}
