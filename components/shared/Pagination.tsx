'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageParam?: string
}

export function Pagination({ currentPage, totalPages, pageParam = 'page' }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete(pageParam)
    } else {
      params.set(pageParam, String(page))
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  // Show at most 5 page numbers centered on currentPage
  const delta = 2
  const start = Math.max(1, currentPage - delta)
  const end = Math.min(totalPages, currentPage + delta)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="flex items-center justify-center gap-1 pt-4">
      <Link
        href={buildUrl(currentPage - 1)}
        aria-disabled={currentPage === 1}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors',
          currentPage === 1
            ? 'pointer-events-none opacity-40 border-border bg-background'
            : 'border-border bg-background hover:bg-muted'
        )}
      >
        <ChevronLeft size={16} />
      </Link>

      {start > 1 && (
        <>
          <Link href={buildUrl(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-sm hover:bg-muted transition-colors">
            1
          </Link>
          {start > 2 && <span className="px-1 text-muted-foreground text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildUrl(p)}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
            p === currentPage
              ? 'border-primary bg-primary text-primary-foreground pointer-events-none'
              : 'border-border bg-background hover:bg-muted'
          )}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted-foreground text-sm">…</span>}
          <Link href={buildUrl(totalPages)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-sm hover:bg-muted transition-colors">
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={buildUrl(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors',
          currentPage === totalPages
            ? 'pointer-events-none opacity-40 border-border bg-background'
            : 'border-border bg-background hover:bg-muted'
        )}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  )
}
