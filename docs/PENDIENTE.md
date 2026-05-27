# Pendiente — Lokro

Tareas ordenadas por prioridad. Actualizar este archivo al completar cada una.

---

## 🔴 Crítico — afecta funcionalidad visible

_Sin tareas críticas pendientes._

---

## 🟡 Medio — necesario antes de lanzar

### 1. Admin: acciones sobre usuarios y solicitudes
**Problema:** Las tablas del panel admin son solo lectura. No hay forma de desactivar un usuario, cambiar su rol, ni cerrar una solicitud problemática.

**Lo que falta:**
- Botón "Desactivar / Activar" en la tabla de usuarios (toggle columna `active` o similar)
- Selector de rol por usuario (cambiar USER ↔ PROVIDER)
- Botón "Cancelar" en solicitudes con estado `PENDING` o `ACCEPTED` desde admin

**Archivos a modificar:**
- `app/(admin)/panel/usuarios/page.tsx` — añadir acciones por fila
- `app/(admin)/panel/solicitudes/page.tsx` — añadir acción de cancelar
- Posiblemente crear Server Actions o endpoints en `app/api/admin/`

**Estimado:** 3–4 horas

---

### 2. Notificaciones por email
**Problema:** Las notificaciones son solo in-app. Si el usuario no tiene la app abierta, nunca se entera de que aceptaron su solicitud o de que debe pagar.

**Eventos que deberían disparar email:**
- Solicitud aceptada → email al usuario
- Pago confirmado → email al proveedor
- Solicitud completada → email al usuario (con link a reseña)

**Solución:**
- Integrar Resend (o SendGrid) con Supabase Edge Functions o desde los webhooks/Server Actions existentes
- Crear plantillas HTML mínimas para cada evento

**Estimado:** 4–6 horas

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
