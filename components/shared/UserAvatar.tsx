import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ name, avatarUrl, className, size = 'md' }: UserAvatarProps) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }
  return (
    <Avatar className={cn(sizes[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
