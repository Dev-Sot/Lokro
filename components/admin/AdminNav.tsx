'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ClipboardList, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/panel', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/panel/usuarios', label: 'Usuarios', icon: Users, exact: false },
  { href: '/panel/solicitudes', label: 'Solicitudes', icon: ClipboardList, exact: false },
  { href: '/panel/prestadores', label: 'Prestadores', icon: Briefcase, exact: false },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="max-w-7xl mx-auto px-4 flex gap-1 border-t">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
