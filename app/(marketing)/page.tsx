import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Star, Shield, Zap, MapPin, Clock, CheckCircle2,
  Wallet, CalendarDays, TrendingUp, Lock, BadgeCheck, Headphones,
} from 'lucide-react'
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

const TRUST = [
  { icon: Lock, title: 'Pago 100% seguro', desc: 'Tu dinero está protegido hasta que confirmes que el trabajo está bien hecho.' },
  { icon: BadgeCheck, title: 'Identidad verificada', desc: 'Cada prestador pasa por un proceso de validación antes de aparecer en el mapa.' },
  { icon: Headphones, title: 'Soporte 7/7', desc: 'Nuestro equipo está disponible todos los días para resolver cualquier inconveniente.' },
]

const PROVIDER_BENEFITS = [
  { icon: Wallet, title: 'Tú fijas tu tarifa', desc: 'Cobra lo que vale tu trabajo. Sin tarifas impuestas.' },
  { icon: CalendarDays, title: 'Tu propio horario', desc: 'Activa y desactiva tu disponibilidad cuando quieras.' },
  { icon: TrendingUp, title: 'Más clientes, menos esfuerzo', desc: 'Llega a clientes cerca de ti sin gastar en publicidad.' },
]

const MOCK_PROVIDERS = [
  { name: 'Carlos R.', cat: '🔧 Plomería', rating: '4.9', top: '12%', left: '10%' },
  { name: 'Ana M.', cat: '🧹 Limpieza', rating: '5.0', top: '55%', left: '72%' },
  { name: 'Diego F.', cat: '⚡ Electricidad', rating: '4.8', top: '75%', left: '15%' },
  { name: 'Sara L.', cat: '📚 Tutoría', rating: '5.0', top: '25%', left: '65%' },
]

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary/8 via-background to-background pt-20 pb-28">
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

          {/* Hero visual — mapa con tarjetas de prestadores */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-gradient-to-br from-primary/5 to-blue-500/5 h-96">
              {/* Fondo de mapa estilizado */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }} />

              {/* Centro del mapa */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center shadow-lg">
                  <MapPin size={36} className="text-primary" />
                </div>
                {/* Anillo pulsante */}
                <div className="absolute h-32 w-32 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="absolute h-48 w-48 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
              </div>

              {/* Tarjetas de prestadores flotantes */}
              {MOCK_PROVIDERS.map((p) => (
                <div
                  key={p.name}
                  className="absolute bg-background/95 backdrop-blur border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs"
                  style={{ top: p.top, left: p.left }}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                    {p.cat.split(' ')[0]}
                  </div>
                  <div>
                    <p className="font-semibold leading-none">{p.name}</p>
                    <p className="text-muted-foreground mt-0.5">{p.cat.split(' ').slice(1).join(' ')} · ⭐ {p.rating}</p>
                  </div>
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
                href="/register"
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
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px border-t-2 border-dashed border-primary/20" />
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

      {/* ── Trust ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Tu seguridad, nuestra prioridad</h2>
            <p className="text-muted-foreground mt-2">
              Cada aspecto de Lokro está diseñado para que estés protegido
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
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

      {/* ── Para prestadores ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          {/* Card de ingresos mock */}
          <div className="relative">
            <div className="rounded-2xl border bg-card shadow-xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos este mes</p>
                  <p className="text-4xl font-bold mt-1">$2.340.000</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Limpieza de oficina', amount: '$180.000', cat: '🧹' },
                  { label: 'Instalación eléctrica', amount: '$320.000', cat: '⚡' },
                  { label: 'Tutoría de matemáticas', amount: '$95.000', cat: '📚' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.cat}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground">Próximo pago en</p>
                <p className="font-bold text-primary text-lg">2 días</p>
              </div>
            </div>
            {/* Badge flotante */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              +23% vs mes anterior
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                Para prestadores
              </div>
              <h2 className="text-4xl font-bold leading-tight">
                Convierte tu talento
                <span className="text-primary block">en ingresos reales</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Miles de clientes cerca de ti buscan exactamente lo que sabes hacer.
                Regístrate, activa tu perfil y empieza a recibir solicitudes hoy mismo.
              </p>
            </div>

            <div className="space-y-5">
              {PROVIDER_BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" asChild>
              <Link href="/register?role=PROVIDER">
                Empezar a ganar
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
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

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-bold">¿Listo para empezar?</h2>
          <p className="text-primary-foreground/80 text-lg">
            Únete a miles de personas que ya confían en Lokro para sus servicios del día a día.
            Gratis, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link href="/register">
                Crear cuenta gratis
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base border-white/30 text-white hover:bg-white/10">
              <Link href="/register?role=PROVIDER">Ser prestador</Link>
            </Button>
          </div>
          <p className="text-primary-foreground/60 text-sm pt-2">
            Sin tarjeta de crédito · Registro en menos de 2 minutos
          </p>
        </div>
      </section>

    </div>
  )
}
