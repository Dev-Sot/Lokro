import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Star, Shield, Zap, MapPin, Clock, CheckCircle2,
  Wallet, CalendarDays, TrendingUp, Lock, BadgeCheck, Headphones,
  Search, Rocket, Wrench, Sparkles, BookOpen, PawPrint, Palette,
  Car, Hammer, Laptop, Utensils, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FAQSection } from '@/components/marketing/FAQSection'

export const metadata: Metadata = {
  title: 'Lokro — Servicios locales a tu alcance',
  description:
    'Encuentra fontaneros, electricistas, tutores y más cerca de ti. Reserva en minutos con garantía de calidad.',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '2.000+', label: 'Profesionales activos' },
  { value: '15.000+', label: 'Servicios completados' },
  { value: '4.8', label: 'Calificación promedio' },
  { value: '< 5 min', label: 'Tiempo de respuesta' },
]

const CATEGORIES: { name: string; icon: LucideIcon; color: string; bg: string }[] = [
  { name: 'Plomería',     icon: Wrench,   color: 'text-blue-600',   bg: 'bg-blue-50' },
  { name: 'Limpieza',     icon: Sparkles, color: 'text-rose-600',   bg: 'bg-rose-50' },
  { name: 'Electricidad', icon: Zap,      color: 'text-amber-600',  bg: 'bg-amber-50' },
  { name: 'Tutoría',      icon: BookOpen, color: 'text-emerald-600',bg: 'bg-emerald-50' },
  { name: 'Veterinaria',  icon: PawPrint, color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'Diseño',       icon: Palette,  color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Mecánica',     icon: Car,      color: 'text-slate-600',  bg: 'bg-slate-100' },
  { name: 'Reparaciones', icon: Hammer,   color: 'text-teal-600',   bg: 'bg-teal-50' },
  { name: 'Tecnología',   icon: Laptop,   color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Cocina',       icon: Utensils, color: 'text-red-600',    bg: 'bg-red-50' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Encuentra', desc: 'Busca profesionales verificados cerca de tu ubicación en tiempo real.', icon: MapPin },
  { step: '02', title: 'Reserva', desc: 'Selecciona horario, describe tu necesidad y confirma con un clic.', icon: Clock },
  { step: '03', title: 'Disfruta', desc: 'El profesional llega, hace el trabajo y tú valoras la experiencia.', icon: CheckCircle2 },
]

const TRUST: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Lock,      title: 'Pago 100% seguro',     desc: 'Tu dinero está protegido hasta que confirmes que el trabajo está bien hecho.' },
  { icon: BadgeCheck,title: 'Identidad verificada', desc: 'Cada prestador pasa por un proceso de validación antes de aparecer en el mapa.' },
  { icon: Headphones,title: 'Soporte 7/7',           desc: 'Nuestro equipo está disponible todos los días para resolver cualquier inconveniente.' },
]

const FEATURES = [
  { icon: Shield,    title: 'Profesionales verificados', desc: 'Seguridad y confianza en cada servicio.' },
  { icon: Zap,       title: 'Respuesta en minutos',      desc: 'Conexión inmediata con expertos cercanos.' },
  { icon: Star,      title: 'Calidad garantizada',       desc: 'Calificaciones reales de usuarios verificados.' },
]

const PROVIDER_BENEFITS = [
  { icon: Wallet,      title: 'Tú fijas tu tarifa',           desc: 'Cobra lo que vale tu trabajo. Sin tarifas impuestas.' },
  { icon: CalendarDays,title: 'Tu propio horario',             desc: 'Activa y desactiva tu disponibilidad cuando quieras.' },
  { icon: TrendingUp,  title: 'Más clientes, menos esfuerzo', desc: 'Llega a clientes cerca de ti sin gastar en publicidad.' },
]

const TESTIMONIALS = [
  { name: 'Ana Rodríguez', location: 'Chapinero, Bogotá',  initials: 'AR', bg: 'bg-blue-500',    text: 'Encontré un plomero en menos de 5 minutos. Llegó en 20 minutos y solucionó la fuga. Increíble.' },
  { name: 'Carlos M.',     location: 'El Chicó, Bogotá',   initials: 'CM', bg: 'bg-emerald-500', text: 'Uso Lokro cada semana para distintos servicios en mi oficina. La calidad es consistente.' },
  { name: 'Laura Torres',  location: 'Suba, Bogotá',       initials: 'LT', bg: 'bg-rose-500',    text: 'Gracias a Lokro encontré una tutora excelente para mi hijo. Subió sus notas en menos de un mes.' },
]

const MOCK_PROVIDERS: { name: string; cat: string; icon: LucideIcon; rating: string; iconColor: string; bg: string; pos: string }[] = [
  { name: 'Carlos R.',  cat: 'Plomería',     icon: Wrench,   rating: '4.9', iconColor: 'text-blue-600',    bg: 'bg-blue-100',    pos: 'top-6 left-4' },
  { name: 'Andrea M.',  cat: 'Electricidad', icon: Zap,      rating: '5.0', iconColor: 'text-amber-600',   bg: 'bg-amber-100',   pos: 'top-14 right-4' },
  { name: 'Sofía L.',   cat: 'Limpieza',     icon: Sparkles, rating: '4.8', iconColor: 'text-rose-600',    bg: 'bg-rose-100',    pos: 'bottom-20 left-8' },
  { name: 'Daniel P.',  cat: 'Tutoría',      icon: BookOpen, rating: '4.9', iconColor: 'text-emerald-600', bg: 'bg-emerald-100', pos: 'bottom-6 right-4' },
]

const DASHBOARD_ITEMS: { label: string; time: string; amount: string; icon: LucideIcon; iconColor: string; bg: string }[] = [
  { label: 'Limpieza de casa',     time: 'Hoy, 10:00 AM',  amount: '$180.000', icon: Sparkles, iconColor: 'text-rose-600',    bg: 'bg-rose-50' },
  { label: 'Instalación eléctrica',time: 'Ayer, 2:30 PM',  amount: '$320.000', icon: Zap,      iconColor: 'text-amber-600',   bg: 'bg-amber-50' },
  { label: 'Tutoría matemáticas',  time: 'Lun, 4:00 PM',   amount: '$95.000',  icon: BookOpen, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const QUICK_CATS: { label: string; icon: LucideIcon }[] = [
  { label: 'Plomería',     icon: Wrench },
  { label: 'Electricidad', icon: Zap },
  { label: 'Limpieza',     icon: Sparkles },
  { label: 'Tutoría',      icon: BookOpen },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="flex flex-col items-start space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
              <Rocket size={14} />
              Ya disponible en Colombia
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
              Servicios locales{' '}
              <span className="text-primary">a un toque</span>{' '}
              de distancia
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Lokro conecta personas con profesionales de confianza cerca de su ubicación.
              Fontaneros, electricistas, tutores y mucho más.
            </p>

            {/* Search bar */}
            <div className="w-full max-w-xl space-y-3">
              <div className="flex items-center bg-background border rounded-xl shadow-sm p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <MapPin className="h-5 w-5 text-muted-foreground ml-2 shrink-0" />
                <Input
                  type="text"
                  placeholder="¿Qué servicio necesitas?"
                  className="border-0 shadow-none focus-visible:ring-0 text-base"
                />
                <Button className="shrink-0 rounded-lg px-5" asChild>
                  <Link href="/register">
                    <Search size={16} className="mr-1.5" />
                    Buscar
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CATS.map(({ label, icon: Icon }) => (
                  <Link
                    key={label}
                    href="/register"
                    className="inline-flex items-center gap-1.5 rounded-full border hover:border-primary/50 hover:bg-primary/5 px-4 py-1.5 text-sm font-medium text-foreground transition-colors"
                  >
                    <Icon size={13} className="text-muted-foreground" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" asChild className="text-base h-12">
                <Link href="/register">
                  Buscar profesionales
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-12">
                <Link href="/register?role=PROVIDER">Ofrecer mis servicios</Link>
              </Button>
            </div>
          </div>

          {/* Right — mapa estilizado */}
          <div className="relative hidden lg:block h-[480px] rounded-3xl bg-blue-50 overflow-hidden border border-blue-100 shadow-xl">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #93c5fd 1px, transparent 1px), linear-gradient(to bottom, #93c5fd 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-white/60 -rotate-[3deg] scale-110" />
            <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-white/60 rotate-[12deg] scale-110" />
            <div className="absolute top-2/3 left-0 right-0 h-3 bg-white/60 rotate-[6deg] scale-110" />

            {/* Pulsing center pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 bg-primary rounded-full animate-ping opacity-30" />
                <div className="absolute w-10 h-10 bg-primary rounded-full animate-ping opacity-50" style={{ animationDelay: '0.3s' }} />
                <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Provider cards */}
            {MOCK_PROVIDERS.map(({ name, cat, icon: Icon, rating, iconColor, bg, pos }) => (
              <div
                key={name}
                className={`absolute ${pos} bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 w-44 z-20`}
              >
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="truncate">{cat}</span>
                    <span>·</span>
                    <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                    <span>{rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-4xl font-bold tracking-tight">{s.value}</span>
                  {i === 2 && <Star size={20} className="fill-amber-300 text-amber-300 mb-1" />}
                </div>
                <span className="text-sm text-primary-foreground/80">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">¿Qué necesitas hoy?</h2>
            <p className="text-muted-foreground mt-2 text-lg">Encuentra al experto ideal para cualquier tarea.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.map(({ name, icon: Icon, color, bg }) => (
              <Link
                key={name}
                href="/register"
                className="group flex flex-col items-center gap-3 rounded-2xl border bg-background p-6 text-center hover:border-primary/50 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={26} className={color} />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Cómo funciona</h2>
            <p className="text-muted-foreground mt-2 text-lg">Simple. Rápido. Confiable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px border-t-2 border-dashed border-primary/20" />
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon size={32} className="text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Tu seguridad, nuestra prioridad</h2>
            <p className="text-muted-foreground mt-2">Cada aspecto de Lokro está diseñado para que estés protegido.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Icon size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Lokro ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold">Por qué elegir Lokro</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Icon size={30} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-primary-foreground/80 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para prestadores ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">

          {/* Dashboard mock */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border bg-card shadow-xl p-8 max-w-md mx-auto lg:mx-0 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos este mes</p>
                  <p className="text-4xl font-bold mt-1">$2.340.000</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <TrendingUp size={16} />
                  +18%
                </div>
              </div>
              <div className="space-y-1">
                {DASHBOARD_ITEMS.map(({ label, time, amount, icon: Icon, iconColor, bg }) => (
                  <div key={label} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                        <Icon size={18} className={iconColor} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{amount}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t flex justify-center">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                  Próximo pago en 2 días
                </Badge>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 flex flex-col items-start space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                Para prestadores
              </div>
              <h2 className="text-4xl font-bold leading-tight">
                Convierte tu talento{' '}
                <span className="text-primary">en ingresos reales</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Únete a la red de profesionales más grande de Colombia. Conecta con clientes
                cercanos que necesitan tus habilidades hoy mismo.
              </p>
            </div>
            <div className="space-y-6">
              {PROVIDER_BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 items-start">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/register?role=PROVIDER">
                Empezar a ganar
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold">Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, initials, bg, text }) => (
              <div key={name} className="rounded-2xl border bg-background p-8 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic flex-grow mb-8">"{text}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-11 h-11 rounded-full ${bg} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── CTA Final ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">¿Listo para empezar?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Únete a miles de personas que ya confían en Lokro para sus servicios del día a día.
            Gratis, sin compromisos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" variant="secondary" asChild className="text-base h-14 px-8 font-semibold">
              <Link href="/register">
                Crear cuenta gratis
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base h-14 px-8 font-semibold border-white/30 text-white hover:bg-white/10"
            >
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
