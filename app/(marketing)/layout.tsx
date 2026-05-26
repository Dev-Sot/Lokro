import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lokro. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Términos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Soporte</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
