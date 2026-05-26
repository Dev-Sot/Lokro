# Lokro

Marketplace de servicios locales que conecta usuarios con prestadores de servicios cercanos (plomeros, electricistas, tutores, diseñadores, etc.) mediante geolocalización y disponibilidad en tiempo real.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript (strict)
- **Estilos:** Tailwind CSS + shadcn/ui
- **Base de datos:** Supabase (PostgreSQL + Realtime + Storage)
- **Mapas:** Mapbox GL JS
- **Pagos:** Stripe (PaymentIntents con captura manual)
- **Validación:** Zod + React Hook Form
- **Estado:** Zustand
- **Deploy:** Vercel

## Requisitos previos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Mapbox](https://mapbox.com)
- Cuenta en [Stripe](https://stripe.com)

## Instalación

```bash
git clone https://github.com/tu-usuario/lokro.git
cd lokro
npm install
```

## Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de service role (solo servidor) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token público de Mapbox |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (ej. `https://lokro.vercel.app`) |

## Configuración de Supabase

### 1. Ejecutar migraciones

En el SQL Editor de tu proyecto Supabase, ejecuta los archivos en orden:

```sql
-- 1. Esquema inicial (tablas, enums, triggers)
-- Contenido de: supabase/migrations/001_initial_schema.sql

-- 2. Políticas RLS
-- Contenido de: supabase/policies.sql

-- 3. Datos de prueba (opcional)
-- Contenido de: supabase/seed.sql
```

### 2. Configurar autenticación

En el panel de Supabase → Authentication → Providers:
- Habilitar **Email/Password**
- Habilitar **Google OAuth** (requiere Client ID y Secret de Google Cloud Console)

En Authentication → URL Configuration:
- Site URL: `https://tu-dominio.com`
- Redirect URL: `https://tu-dominio.com/auth/callback`

### 3. Configurar Storage

Crear los siguientes buckets en Supabase → Storage:
- `avatars` (público)
- `portfolio` (público)

### 4. Habilitar Realtime

En Database → Replication, habilitar Realtime para las tablas:
- `messages`
- `notifications`
- `provider_locations`
- `service_requests`

## Configuración de Stripe

### Webhook local (desarrollo)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Eventos requeridos:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Webhook producción

Registrar endpoint en el panel de Stripe:
- URL: `https://tu-dominio.com/api/webhooks/stripe`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm run start

# Verificar tipos TypeScript
npx tsc --noEmit

# Linter
npm run lint
```

## Estructura del proyecto

```
lokro/
├── app/
│   ├── (marketing)/          # Landing page pública
│   ├── (auth)/               # Login y registro
│   ├── (user)/               # Rutas del usuario
│   │   ├── home/             # Mapa + listado de prestadores
│   │   ├── providers/[id]/   # Perfil público del prestador
│   │   ├── request/[id]/     # Formulario de solicitud
│   │   ├── chat/             # Mensajería
│   │   ├── tracking/[id]/    # Seguimiento del servicio
│   │   ├── notifications/    # Centro de notificaciones
│   │   └── profile/          # Perfil del usuario
│   ├── (provider)/           # Rutas del prestador
│   │   ├── dashboard/        # Panel principal
│   │   ├── requests/         # Gestión de solicitudes
│   │   ├── schedule/         # Agenda semanal
│   │   └── earnings/         # Historial de pagos
│   ├── (admin)/              # Panel de administración
│   ├── api/
│   │   ├── stripe/           # Creación de PaymentIntents
│   │   └── webhooks/stripe/  # Webhook de Stripe
│   └── auth/callback/        # Callback OAuth
├── components/
│   ├── ui/                   # Componentes shadcn/ui (Radix UI)
│   ├── shared/               # Componentes compartidos
│   ├── map/                  # Mapa Mapbox
│   ├── providers/            # Cards y filtros de prestadores
│   ├── chat/                 # Ventana de chat
│   └── requests/             # Formulario de reseña
├── lib/
│   ├── supabase/             # Clientes Supabase (browser/server/middleware)
│   ├── services/             # Storage y notificaciones
│   ├── validations/          # Esquemas Zod
│   ├── stripe.ts             # Cliente Stripe + utilidades de fees
│   └── utils.ts              # Utilidades generales
├── store/                    # Zustand stores (user, map)
├── hooks/                    # Custom hooks (auth, geolocation, realtime)
├── types/                    # Tipos TypeScript centralizados
├── constants/                # Constantes de la app
└── supabase/
    ├── migrations/           # Esquema SQL
    ├── policies.sql          # Políticas RLS
    └── seed.sql              # Datos de prueba
```

## Arquitectura

- **Server Components** por defecto para data fetching
- **Client Components** (`'use client'`) solo donde se necesita interactividad
- **RLS** en todas las tablas de Supabase
- **Middleware** para protección de rutas y redirección por rol
- Tres roles: `USER`, `PROVIDER`, `ADMIN`

## Deploy en Vercel

```bash
vercel --prod
```

Agregar todas las variables de entorno en el panel de Vercel antes del deploy. Asegurarse de actualizar `NEXT_PUBLIC_SITE_URL` con el dominio de producción.
