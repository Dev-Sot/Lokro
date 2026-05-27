# Pendiente — Lokro

Tareas ordenadas por prioridad. Actualizar este archivo al completar cada una.

---

## 🔴 Crítico — afecta funcionalidad visible

_Sin tareas críticas pendientes._

---

## 🟡 Medio — necesario antes de lanzar

### 1. Admin: acciones sobre usuarios y solicitudes ✅
Resuelto: `UserRoleSelect` por fila en usuarios + `CancelRequestButton` en solicitudes cancelables. Server Actions en `app/actions/admin.ts`.

---

### 2. Notificaciones por email ✅
Resuelto: Resend integrado. `lib/services/email.ts` con 3 plantillas HTML. Endpoint autenticado `/api/email/notify`. Se dispara desde `AcceptRejectButtons`, `ChatWindow` y el webhook de MercadoPago.

**Requiere configurar en `.env.local`:**
```
RESEND_API_KEY=re_...
EMAIL_FROM=Lokro <noreply@lokro.app>
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 🟢 Pequeño — polish y visibilidad

### 3. SEO y Open Graph
**Problema:** Las páginas públicas (landing, perfil de proveedor) no tienen meta tags Open Graph ni sitemap. El preview al compartir en WhatsApp/redes sociales es genérico.

**Solución:**
- Añadir `<meta og:*>` en `app/(marketing)/page.tsx` y `app/(user)/providers/[id]/page.tsx`
- Crear `app/sitemap.ts` con rutas estáticas + perfiles de proveedores
- Crear `app/robots.ts`

**Estimado:** 2–3 horas

---

## Completados ✅

| Tarea | Fecha |
|-------|-------|
| Badge de notificaciones siempre en 0 | 2026-05-27 |
| Perfil de usuario sin edición (nombre + avatar) | 2026-05-27 |
| Historial de solicitudes sin links | 2026-05-27 |
| Usuario no puede cancelar sus solicitudes | 2026-05-27 |
| Dark mode toggle | 2026-05-27 |
| Panel de administración completo (tablas + navegación) | 2026-05-27 |
| Exportar ingresos a CSV | 2026-05-27 |
| Cambio de contraseña desde el perfil | 2026-05-27 |
| Admin: cambiar rol de usuario + cancelar solicitudes | 2026-05-27 |
| Notificaciones por email (Resend) | 2026-05-27 |
| Middleware no corría (proxy.ts → middleware.ts) | 2026-05-27 |
| useUser sin catch → loading infinito | 2026-05-27 |
| HomeClient race condition al desmontar | 2026-05-27 |
| useRealtimeNotifications re-suscripción excesiva | 2026-05-27 |
| ChatWindow sender nulo crasheaba la UI | 2026-05-27 |
| storage.ts cliente compartido entre llamadas | 2026-05-27 |
| RequestForm sin verificar navigator.geolocation | 2026-05-27 |
| PaymentClient href con non-null assertion | 2026-05-27 |
| Webhook de pago sin verificar errores de BD | 2026-05-27 |
| create-preference sin manejo de error de API MP | 2026-05-27 |
| TrackingClient geolocation sin callback de error | 2026-05-27 |
| NotificationsClient markAllRead sin catch | 2026-05-27 |
