# Pendiente — Lokro

Tareas ordenadas por prioridad. Actualizar este archivo al completar cada una.

---

## 🔴 Crítico — afecta funcionalidad visible

### 1. Badge de notificaciones siempre en 0
**Problema:** El hook `useRealtimeNotifications` existe en `hooks/useRealtimeNotifications.ts` pero nunca se llama. El contador inicial tampoco se carga de la BD al entrar. La campana siempre muestra 0.

**Impacto:** El usuario no sabe que tiene notificaciones sin leer.

**Solución:**
- Crear `components/shared/NotificationsInitializer.tsx` — componente cliente que:
  1. Carga el conteo inicial de `notifications` donde `read = false`
  2. Llama a `useRealtimeNotifications(userId)` para incrementar en tiempo real
- Incluirlo en `app/(user)/layout.tsx` (ya es servidor, pasarle el userId y count inicial como props)

**Archivos a crear/modificar:**
- `components/shared/NotificationsInitializer.tsx` (crear)
- `app/(user)/layout.tsx` (modificar — incluir el inicializador)

**Estimado:** 1–2 horas

---

### 2. Perfil de usuario sin edición
**Problema:** `app/(user)/profile/page.tsx` es completamente de solo lectura. El usuario no puede cambiar su nombre ni subir avatar. El proveedor sí tiene página de edición completa.

**Impacto:** El usuario no puede personalizar su cuenta.

**Solución:**
- Añadir formulario de edición en `/profile` (nombre + avatar) reutilizando lógica de `lib/services/storage.ts`
- O crear `/profile/edit` como ruta separada

**Archivos a modificar:**
- `app/(user)/profile/page.tsx` — añadir sección de edición o link a `/profile/edit`

**Estimado:** 2–3 horas

---

### 3. Historial de solicitudes sin links
**Problema:** En `/profile` se listan las solicitudes pero los items no son clicables. No hay forma de ir al chat o tracking desde ahí.

**Impacto:** El usuario no puede retomar conversaciones ni ver el seguimiento de solicitudes pasadas.

**Solución:**
- Envolver cada item en `<Link href={/chat/${req.id}}>` en `app/(user)/profile/page.tsx`
- Añadir link condicional a `/tracking/${req.id}` si `status === 'IN_PROGRESS'`

**Archivos a modificar:**
- `app/(user)/profile/page.tsx` (líneas 67–91)

**Estimado:** 30 minutos

---

### 4. Usuario no puede cancelar sus propias solicitudes
**Problema:** No hay botón de cancelar desde el lado del usuario para solicitudes en estado `PENDING` o `ACCEPTED`. El proveedor sí puede rechazar/cancelar.

**Impacto:** El usuario queda atrapado en una solicitud que ya no quiere.

**Solución:**
- Añadir botón "Cancelar solicitud" en `components/chat/ChatWindow.tsx` cuando `!isProvider && (status === 'PENDING' || status === 'ACCEPTED')`
- Llamar a `updateStatus('CANCELLED')` (función ya existe en el componente)

**Archivos a modificar:**
- `components/chat/ChatWindow.tsx`

**Estimado:** 30 minutos

---

## 🟡 Medio — mejora la gestión de la plataforma

### 5. Panel de administración completo
**Problema:** `app/(admin)/panel/page.tsx` solo muestra 4 métricas globales y estado del sistema. No hay gestión de nada.

**Lo que falta:**
- Tabla de usuarios con filtro por rol y opción de desactivar/cambiar rol
- Tabla de solicitudes recientes con estado
- Tabla de pagos con posibilidad de ver detalles
- Tabla de proveedores con rating y estado de disponibilidad

**Archivos a crear:**
- `app/(admin)/usuarios/page.tsx`
- `app/(admin)/solicitudes/page.tsx`
- `app/(admin)/layout.tsx` (ya existe, añadir navegación interna)

**Estimado:** 1–2 días

---

### 6. Editar perfil del usuario — cambio de contraseña
**Problema:** Además de nombre/avatar, el usuario no tiene forma de cambiar su contraseña desde el perfil (solo existe el flujo de forgot password que requiere salir de la sesión).

**Solución:**
- Añadir sección "Cambiar contraseña" en `/profile/edit` usando `supabase.auth.updateUser({ password })`

**Estimado:** 1–2 horas

---

## 🟢 Pequeño — polish y UX

### 7. Dark mode toggle
**Problema:** `next-themes` está instalado y configurado pero no hay ningún botón de toggle en la UI.

**Solución:**
- Añadir `<ThemeToggle />` en `UserNavbar` y `ProviderNavbar`
- Crear `components/shared/ThemeToggle.tsx` (un botón que alterna entre light/dark con `useTheme()`)

**Estimado:** 1 hora

---

### 8. Exportar ingresos a CSV
**Problema:** La página de ingresos muestra la tabla de pagos pero no hay forma de exportar para contabilidad o impuestos.

**Solución:**
- Crear `app/api/exports/earnings/route.ts` que devuelva CSV
- Añadir botón "Exportar CSV" en `app/(provider)/earnings/page.tsx`

**Estimado:** 2–3 horas

---

## Completados ✅

| Tarea | Fecha |
|-------|-------|
| Badge de notificaciones siempre en 0 | 2026-05-27 |
| Perfil de usuario sin edición (nombre + avatar) | 2026-05-27 |
| Historial de solicitudes sin links | 2026-05-27 |
| Usuario no puede cancelar sus solicitudes | 2026-05-27 |
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
