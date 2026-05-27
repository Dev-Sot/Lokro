import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoMarkProps {
  className?: string
}

function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Pin body */}
      <path
        d="M50 5C27.4 5 9 23.4 9 46C9 68.6 50 120 50 120C50 120 91 68.6 91 46C91 23.4 72.6 5 50 5Z"
        fill="#2563EB"
      />
      {/* Person head */}
      <circle cx="50" cy="37" r="16" fill="white" />
      {/* Person shoulders */}
      <path
        d="M17 67C17 51 31 44 50 44C69 44 83 51 83 67Z"
        fill="white"
      />
    </svg>
  )
}

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  iconOnly?: boolean
}

const sizes = {
  sm: { icon: 'h-6 w-5', text: 'text-lg' },
  md: { icon: 'h-8 w-[26px]', text: 'text-2xl' },
  lg: { icon: 'h-12 w-10', text: 'text-4xl' },
}

export function Logo({ className, size = 'md', iconOnly = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2 shrink-0 select-none', className)}
    >
      <LogoMark className={sizes[size].icon} />
      {!iconOnly && (
        <span className={cn('font-bold tracking-tight leading-none', sizes[size].text)}>
          <span className="text-primary">Lok</span>
          <span className="text-foreground">ro</span>
        </span>
      )}
    </Link>
  )
}
