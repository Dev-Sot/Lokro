'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function EarningsExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch('/api/exports/earnings')
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ingresos-lokro-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('No se pudo exportar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Exportar CSV
    </Button>
  )
}
