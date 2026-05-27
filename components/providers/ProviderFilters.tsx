'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/constants'
import { useMapStore } from '@/store/useMapStore'
import { formatCurrency, cn } from '@/lib/utils'

const MAX_PRICE = 300000
const PRICE_STEP = 10000

export function ProviderFilters() {
  const { filters, setFilters } = useMapStore()
  const [open, setOpen] = useState(false)

  const hasFilters =
    filters.category || filters.maxDistance || filters.maxPrice || filters.minRating

  function clearFilters() {
    setFilters({ category: undefined, maxDistance: undefined, maxPrice: undefined, minRating: undefined })
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasFilters ? 'default' : 'outline'}
            size="sm"
            className={cn('gap-2', hasFilters && 'ring-2 ring-primary/30')}
          >
            <Filter size={14} />
            Filtros
            {hasFilters && (
              <span className="h-4 w-4 rounded-full bg-primary-foreground text-primary text-[10px] font-bold flex items-center justify-center">
                {[filters.category, filters.maxDistance, filters.maxPrice, filters.minRating].filter(Boolean).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-5 p-5" align="start">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Filtros</p>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                Limpiar todo
              </Button>
            )}
          </div>

          {/* Category — value is the category name so it matches specialties[] in ProviderMapMarker */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={filters.category ?? 'all'}
              onValueChange={(v) => setFilters({ category: v === 'all' ? undefined : v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Distancia máxima</Label>
              <span className="text-xs text-muted-foreground">
                {filters.maxDistance ? `${filters.maxDistance} km` : 'Cualquiera'}
              </span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[filters.maxDistance ?? 50]}
              onValueChange={(vals) => {
                const v = vals[0] ?? 50
                setFilters({ maxDistance: v === 50 ? undefined : v })
              }}
            />
          </div>

          {/* Price — COP range */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Precio máximo/hora</Label>
              <span className="text-xs text-muted-foreground">
                {filters.maxPrice ? formatCurrency(filters.maxPrice) : 'Cualquiera'}
              </span>
            </div>
            <Slider
              min={PRICE_STEP}
              max={MAX_PRICE}
              step={PRICE_STEP}
              value={[filters.maxPrice ?? MAX_PRICE]}
              onValueChange={(vals) => {
                const v = vals[0] ?? MAX_PRICE
                setFilters({ maxPrice: v === MAX_PRICE ? undefined : v })
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatCurrency(PRICE_STEP)}</span>
              <span>{formatCurrency(MAX_PRICE)}+</span>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Calificación mínima</Label>
            <Select
              value={String(filters.minRating ?? 0)}
              onValueChange={(v) => setFilters({ minRating: Number(v) || undefined })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Cualquiera</SelectItem>
                <SelectItem value="3">★★★ 3+</SelectItem>
                <SelectItem value="4">★★★★ 4+</SelectItem>
                <SelectItem value="4.5">★★★★½ 4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" size="sm" onClick={() => setOpen(false)}>
            Aplicar filtros
          </Button>
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearFilters}>
          <X size={14} />
        </Button>
      )}
    </div>
  )
}