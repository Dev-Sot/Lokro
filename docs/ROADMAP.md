# Roadmap — Lokro

Marketplace de servicios locales por geolocalización.  
Stack: Next.js 16 · React 19 · Supabase · Mapbox · Mercado Pago · TypeScript · Tailwind v4

---

## Estado general

| Fase | Estado |
|------|--------|
| Fase 1 — Infraestructura y auth | ✅ Completo |
| Fase 2 — Flujo usuario | ✅ Completo |
| Fase 3 — Flujo proveedor | ✅ Completo |
| Fase 4 — Correcciones y features faltantes | ✅ Completo (2026-05-27) |
| Fase 5 — Pre-lanzamiento | ⚠️ En curso |

---

## Fases

### Fase 1 — Base ✅
- Autenticación email + Google con selección de rol
- Flujo de forgot/reset password
- Middleware de sesión y redirección por rol
- Landing page con hero, features y CTA
- Layouts por rol (USER / PROVIDER / ADMIN)
- Navbar responsive con bottom nav móvil
- Sistema de toast, avatares, badges de estado

### Fase 2 — Flujo usuario ✅
- Home con mapa Mapbox + proveedores en tiempo real
- Búsqueda y filtros (categoría, rating, precio, distancia)
- Página explore con paginación y filtro por categoría
- Perfil público de proveedor (bio, portafolio, rating, reseñas)
- Formulario de solicitud con geolocalización
- Chat en tiempo real con typing indicator y mark-as-read
- Pago con Mercado Pago (preferencia + webhook + BD)
- Tracking con ubicación del proveedor en tiempo real
- Historial de solicitudes en perfil (con links a chat y tracking)
- Cancelar solicitudes propias desde el chat

### Fase 3 — Flujo proveedor ✅
- Onboarding: ubicación (mapa), bio, especialidades, portafolio, tarifa
- Edición de perfil completa con subida de avatar e imágenes
- Dashboard con stats, toggle de disponibilidad, solicitudes recientes
- Página de solicitudes con tabs (activas / completadas / canceladas)
- Aceptar y rechazar solicitudes desde dashboard y página
- Botones de estado en chat (En camino, Completado)
- Review bidireccional al completar (usuario ↔ proveedor)
- Agenda semanal con citas del proveedor
- Página de ingresos con historial paginado y desglose de comisión
- Exportar ingresos a CSV
- Notificaciones en tiempo real

### Fase 4 — Correcciones y features faltantes ✅ (2026-05-27)
- Auditoría completa: 12 bugs críticos corregidos (ver `AUDITORIA.md`)
- Badge de notificaciones con conteo real + suscripción realtime
- Perfil de usuario editable (nombre, avatar, contraseña)
- Dark mode toggle en todas las navbars
- Panel de admin con tablas de usuarios, solicitudes y prestadores
- Corrección de middleware (proxy.ts → middleware.ts)

### Fase 5 — Pre-lanzamiento ⚠️
Ver [`PENDIENTE.md`](./PENDIENTE.md) para detalle y estimados.

| Tarea | Prioridad | Estado |
|-------|-----------|--------|
| Admin: acciones (desactivar usuarios, cambiar roles, cancelar solicitudes) | 🟡 Medio | Pendiente |
| Notificaciones por email (Resend) en eventos clave | 🟡 Medio | Pendiente |
| SEO: Open Graph + sitemap + robots.txt | 🟢 Pequeño | Pendiente |

---

## Arquitectura de archivos clave

```
app/
  (auth)/          login, register, forgot-password, reset-password
  (marketing)/     landing page
  (user)/          home, explore, providers, request, pay, chat, tracking, notifications, profile
  (provider)/      dashboard, requests, perfil, schedule, earnings
  (admin)/         panel → page, usuarios, solicitudes, prestadores
  api/
    mercadopago/   create-preference
    webhooks/      mercadopago (webhook de pago)
    exports/       earnings (CSV)
    auth/          callback

components/
  chat/            ChatWindow
  map/             ProviderMap
  providers/       ProviderCard, ProviderFilters
  requests/        ReviewForm, AcceptRejectButtons
  admin/           AdminNav
  provider/        EarningsExportButton
  shared/          UserNavbar, ProviderNavbar, UserAvatar, StatusBadge,
                   Pagination, ThemeToggle, NotificationsInitializer

hooks/             useUser, useGeolocation, useRealtimeNotifications
store/             useUserStore (zustand), useMapStore (zustand)
lib/
  supabase/        client, server, middleware
  services/        storage, notifications
  validations/     auth, service

docs/
  ROADMAP.md       este archivo
  PENDIENTE.md     tareas activas con detalle
  AUDITORIA.md     bugs corregidos con causa y solución
```
