import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { CheckCircle2 } from 'lucide-react'

const TRUST_POINTS = [
  'Profesionales verificados y calificados',
  'Pago seguro con Mercado Pago',
  'Soporte 7 días a la semana',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden">
        {/* Background photo */}
        <Image
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80"
          alt="Profesionales trabajando"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
          <Logo size="lg" iconOnly />

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Lokro</p>
              <blockquote className="text-2xl font-semibold leading-snug">
                "Encontré al plomero perfecto en 10 minutos. El pago fue seguro y el servicio excelente."
              </blockquote>
              <footer className="text-sm opacity-70 mt-2">— Valentina R., Bogotá</footer>
            </div>

            <div className="space-y-2.5 pt-2">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="flex items-center gap-2.5 text-sm opacity-90">
                  <CheckCircle2 size={16} className="text-green-300 shrink-0" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs opacity-50">© {new Date().getFullYear()} Lokro. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center px-4 py-12 bg-background">
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 text-xs text-muted-foreground text-center">
          Al continuar, aceptas los{' '}
          <Link href="#" className="underline hover:text-foreground">Términos de servicio</Link>{' '}
          y la{' '}
          <Link href="#" className="underline hover:text-foreground">Política de privacidad</Link>.
        </p>
      </div>
    </div>
  )
}
