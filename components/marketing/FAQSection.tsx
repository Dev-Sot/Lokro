'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: '¿Lokro es gratis para los usuarios?', a: 'Sí, usar Lokro es completamente gratis. Solo pagas el servicio que contratas.' },
  { q: '¿Cómo se verifican los prestadores?', a: 'Cada prestador pasa por validación de identidad, antecedentes y referencias antes de aparecer en la plataforma.' },
  { q: '¿Qué pasa si no estoy satisfecho con el servicio?', a: 'Tu pago queda retenido hasta que confirmas el trabajo. Si hay un problema, nuestro equipo de soporte interviene y reembolsamos si corresponde.' },
  { q: '¿En qué ciudades está disponible Lokro?', a: 'Actualmente operamos en Bogotá, Medellín y Cali, con planes de expansión a más ciudades de Colombia durante 2026.' },
  { q: '¿Cuánto cobra Lokro de comisión?', a: 'Lokro cobra una comisión del 10% sobre cada servicio completado al prestador. Para los usuarios siempre es gratis.' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-medium text-foreground hover:text-primary transition-colors"
      >
        {q}
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      )}
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">Preguntas frecuentes</h2>
        </div>
        <div className="divide-y divide-border rounded-2xl border bg-background px-6">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
