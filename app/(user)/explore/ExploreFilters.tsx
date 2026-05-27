import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/constants'
import { cn } from '@/lib/utils'

interface Props {
  active: string | undefined
}

export function ExploreFilters({ active }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={!active ? 'default' : 'outline'}
        size="sm"
        className="shrink-0"
        asChild
      >
        <Link href="/explore">Todos</Link>
      </Button>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.id}
          variant={active === cat.id ? 'default' : 'outline'}
          size="sm"
          className={cn('shrink-0 gap-1.5', active === cat.id && 'ring-2 ring-primary/30')}
          asChild
        >
          <Link href={`/explore?category=${cat.id}`}>
            <span>{cat.icon}</span>
            {cat.name}
          </Link>
        </Button>
      ))}
    </div>
  )
}