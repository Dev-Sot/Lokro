import Link from 'next/link'
import { Instagram, Twitter, Linkedin } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#como-funciona" className="hover:text-foreground transition-colors">¿Cómo funciona?</Link>
              <Link href="#servicios" className="hover:text-foreground transition-colors">Servicios</Link>
              <Link href="#prestadores" className="hover:text-foreground transition-colors">Para prestadores</Link>
            </nav>
          </div>
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

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <p className="text-2xl font-bold text-blue-400 mb-3">Lokro</p>
              <p className="text-sm mb-6">Servicios locales a un toque de distancia.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">Servicios</Link></li>
                <li><Link href="/register?role=PROVIDER" className="hover:text-white transition-colors">Para prestadores</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Compañía</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Sobre nosotros</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Centro de ayuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-sm text-center md:text-left">
              © {new Date().getFullYear()} Lokro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
