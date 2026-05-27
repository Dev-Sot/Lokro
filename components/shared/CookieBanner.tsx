'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COOKIE_KEY = 'lokro_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  function reject() {
    localStorage.setItem(COOKIE_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            Usamos cookies esenciales para el funcionamiento de la sesión. No hay cookies publicitarias.{' '}
            <Link href="/privacidad" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Política de privacidad
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={reject} className="text-slate-600">
            Rechazar
          </Button>
          <Button size="sm" onClick={accept}>
            Aceptar
          </Button>
          <button
            onClick={reject}
            className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
