import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  return (
    <Link href="/" className={cn('font-bold tracking-tight', sizes[size], className)}>
      <span className="text-primary">Lok</span>
      <span className="text-foreground">ro</span>
    </Link>
  )
}
