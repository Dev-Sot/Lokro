import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <Logo size="lg" className="text-primary-foreground [&>span]:text-primary-foreground" />
        <div className="space-y-4">
          <blockquote className="text-2xl font-semibold leading-snug">
            "Lokro conectó a mi empresa con el electricista perfecto en menos de 10 minutos."
          </blockquote>
          <footer className="text-sm opacity-80">— Carlos M., Bogotá</footer>
        </div>
        <div className="text-sm opacity-60">
          © {new Date().getFullYear()} Lokro. Confianza. Rapidez. Cercanía.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 text-xs text-muted-foreground text-center">
          Al continuar, aceptas los{' '}
          <Link href="#" className="underline hover:text-foreground">
            Términos de servicio
          </Link>{' '}
          y la{' '}
          <Link href="#" className="underline hover:text-foreground">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
