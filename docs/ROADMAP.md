# Roadmap — Lokro

Marketplace de servicios locales por geolocalización.  
Stack: Next.js 16 · React 19 · Supabase · Mapbox · Mercado Pago · TypeScript · Tailwind v4

---

## Estado general

| Fase | Estado |
|------|--------|
| Infraestructura y auth | ✅ Completo |
| Flujo usuario (buscar → solicitar → pagar) | ✅ Completo |
| Flujo proveedor (onboarding → gestionar → cobrar) | ✅ Completo |
| Notificaciones en tiempo real | ⚠️ Parcial — badge siempre en 0 |
| Perfil editable del usuario regular | ❌ Pendiente |
| Panel de administración completo | ⚠️ Parcial — solo métricas |
| Cancelación de solicitudes (lado usuario) | ❌ Pendiente |
| Dark mode | ❌ Pendiente |
| Auditoría de bugs críticos | ✅ Completo (2026-05-27) |

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
- Historial de solicitudes en perfil de usuario

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
- Notificaciones en tiempo real

### Fase 4 — Pendiente ⚠️
Ver [`PENDIENTE.md`](./PENDIENTE.md) para detalle de cada tarea.

---

## Arquitectura de archivos clave

```
app/
  (auth)/          login, register, forgot-password, reset-password
  (marketing)/     landing page
  (user)/          home, explore, providers, request, pay, chat, tracking, notifications, profile
  (provider)/      dashboard, requests, perfil, schedule, earnings
  (admin)/         panel
  api/
    mercadopago/   create-preference
    webhooks/      mercadopago (webhook de pago)
    auth/          callback

components/
  chat/            ChatWindow
  map/             ProviderMap
  providers/       ProviderCard, ProviderFilters
  requests/        ReviewForm, AcceptRejectButtons
  shared/          UserNavbar, ProviderNavbar, UserAvatar, StatusBadge, Pagination

hooks/             useUser, useGeolocation, useRealtimeNotifications
store/             useUserStore (zustand), useMapStore (zustand)
lib/
  supabase/        client, server, middleware
  services/        storage, notifications
  validations/     auth, service
```
