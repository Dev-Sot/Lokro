import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Zap, MapPin, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/constants'

export const metadata: Metadata = {
  title: 'Lokro — Servicios locales a tu alcance',
  description:
    'Encuentra fontaneros, electricistas, tutores y más cerca de ti. Reserva en minutos con garantía de calidad.',
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Encuentra',
    desc: 'Busca profesionales verificados cerca de tu ubicación en tiempo real.',
    icon: MapPin,
  },
  {
    step: '02',
    title: 'Reserva',
    desc: 'Selecciona horario, describe tu necesidad y confirma con un clic.',
    icon: Clock,
  },
  {
    step: '03',
    title: 'Disfruta',
    desc: 'El profesional llega, hace el trabajo y tú valoras la experiencia.',
    icon: CheckCircle2,
  },
]

const TESTIMONIALS = [
  {
    name: 'Ana Rodríguez',
    role: 'Usuaria en Chapinero, Bogotá',
    text: 'Encontré un plomero en menos de 5 minutos. Llegó en 20 minutos y solucionó la fuga. Increíble.',
    rating: 5,
  },
  {
    name: 'Carlos M.',
    role: 'Empresario en El Chicó, Bogotá',
    text: 'Uso Lokro cada semana para distintos servicios en mi oficina. La calidad es consistente.',
    rating: 5,
  },
  {
    name: 'Laura Torres',
    role: 'Madre de familia en Suba, Bogotá',
    text: 'Gracias a Lokro encontré una tutora excelente para mi hijo. Subió sus notas en menos de un mes.',
    rating: 5,
  },
]

const FEATURES = [
  { icon: Shield, title: 'Profesionales verificados', desc: 'Revisión de antecedentes e identidad en todos los prestadores.' },
  { icon: Zap, title: 'Respuesta en minutos', desc: 'Conectamos con el profesional más cercano y disponible.' },
  { icon: Star, title: 'Calidad garantizada', desc: 'Sistema de reseñas bidireccional para máxima transparencia.' },
]

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-background pt-20 pb-28">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              +1,200 profesionales activos ahora mismo
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Servicios locales
              <span className="text-primary block">a un toque</span>
              de distancia
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Lokro conecta a personas con profesionales de confianza cerca de su ubicación.
              Fontaneros, electricistas, tutores, diseñadores y mucho más.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="text-base">
                <Link href="/register">
                  Buscar profesionales
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/register?role=PROVIDER">Ofrecer mis servicios</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-xs text-muted-foreground">Servicios completados</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">4.8★</p>
                <p className="text-xs text-muted-foreground">Calificación media</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs text-muted-foreground">Satisfacción</p>
              </div>
            </div>
          </div>

          {/* Map preview mockup */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-muted h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/5" />
              <div className="relative z-10 text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin size={32} className="text-primary" />
                </div>
                <p className="font-semibold text-lg">Mapa interactivo</p>
                <p className="text-sm text-muted-foreground">Encuentra profesionales en tiempo real</p>
                <Button asChild size="sm">
                  <Link href="/register">Ver mapa</Link>
                </Button>
              </div>
              {/* Fake map pins */}
              {[
                { top: '20%', left: '25%' }, { top: '50%', left: '65%' },
                { top: '70%', left: '35%' }, { top: '30%', left: '75%' },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute h-8 w-8 rounded-full bg-primary/80 border-2 border-white shadow-lg flex items-center justify-center animate-pulse"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">¿Qué necesitas?</h2>
            <p className="text-muted-foreground mt-2">
              Cubrimos más de 10 categorías de servicios para el hogar y el trabajo
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/register`}
                className="group flex flex-col items-center gap-3 rounded-xl border bg-background p-5 text-center hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Cómo funciona</h2>
            <p className="text-muted-foreground mt-2">Simple. Rápido. Confiable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/30 to-primary/30 border-t-2 border-dashed border-primary/20" />
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon size={32} className="text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Por qué elegir Lokro</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-primary-foreground/80 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <div key={name} className="rounded-2xl border bg-background p-6 space-y-4 shadow-sm">
                <div className="flex gap-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">"{text}"</p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-bold">¿Listo para empezar?</h2>
          <p className="text-muted-foreground text-lg">
            Únete a miles de personas que ya confían en Lokro para sus servicios del día a día.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Crear cuenta gratis
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register?role=PROVIDER">Ser prestador</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
