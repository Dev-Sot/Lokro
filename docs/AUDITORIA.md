# Auditoría de bugs — 2026-05-27

Auditoría completa del codebase. Se encontraron y corrigieron 12 bugs reales.  
Todos los cambios están en el branch `main`.

---

## Bugs corregidos

### 1. Middleware nunca corría
**Severidad:** Crítico  
**Archivos:** `proxy.ts` (eliminado) → `middleware.ts` (creado), `lib/supabase/middleware.ts`  
**Problema:** El archivo se llamaba `proxy.ts` con una función `proxy`. Next.js solo reconoce `middleware.ts` con función o export `middleware`. Consecuencias:
- Las cookies de sesión nunca se refrescaban → usuarios con sesiones expiradas
- El header `x-pathname` nunca se enviaba → el layout de proveedor no podía detectar si ya estaba en `/perfil`, causando redirect loop infinito para proveedores sin ubicación configurada

**Fix:** Renombrado a `middleware.ts` con la función correcta. Añadido `x-pathname` en los headers de respuesta.

---

### 2. `useUser` — promesa sin catch
**Severidad:** Alto  
**Archivo:** `hooks/useUser.ts`  
**Problema:** `getUser()` era una función async llamada sin `.catch()`. Si lanzaba excepción, quedaba como unhandled rejection y `loading` permanecía en `true` para siempre (pantalla de carga infinita).  
**Fix:** Añadido `.catch()` y manejo del error de la query a la tabla `users`.

---

### 3. `HomeClient` — race condition al desmontar
**Severidad:** Alto  
**Archivo:** `app/(user)/home/HomeClient.tsx`  
**Problema:** `fetchProviders()` no tenía flag de montado. Si el componente se desmontaba antes de que terminara el fetch, llamaba a `setMarkers` y `setLoading` sobre un componente muerto. Además, si el fetch fallaba, `loading` quedaba en `true`.  
**Fix:** Añadida flag `mounted`, manejo de error con `setLoading(false)` en el catch.

---

### 4. `useRealtimeNotifications` — re-suscripción excesiva
**Severidad:** Medio  
**Archivo:** `hooks/useRealtimeNotifications.ts`  
**Problema:** `incrementUnread` (función de zustand) estaba en el array de dependencias del `useEffect`. Aunque en la práctica zustand la estabiliza, su inclusión podía provocar que el efecto se re-ejecutara y creara múltiples suscripciones concurrentes.  
**Fix:** Removida `incrementUnread` de las dependencias (solo depende de `userId`).

---

### 5. `ChatWindow` — sender nulo crasheaba la UI
**Severidad:** Alto  
**Archivo:** `components/chat/ChatWindow.tsx`  
**Problema:** Cuando llegaba un mensaje en tiempo real, se hacía fetch del sender. Si ese fetch fallaba o devolvía null, el mensaje se añadía con `sender: undefined`. El renderizado posterior intentaba acceder a `sender.name` y crasheaba.  
**Fix:** Si el fetch del sender falla, se loguea el error y no se añade el mensaje al estado (evita render con datos incompletos).

---

### 6. `storage.ts` — cliente Supabase a nivel de módulo
**Severidad:** Medio  
**Archivo:** `lib/services/storage.ts`  
**Problema:** `const supabase = createClient()` estaba en el scope del módulo, creando una única instancia compartida entre todas las llamadas. Causaba problemas de autenticación en uploads concurrentes y podía reutilizar tokens expirados.  
**Fix:** Movida la creación del cliente dentro de cada función.

---

### 7. `RequestForm` — geolocalización sin verificar disponibilidad
**Severidad:** Medio  
**Archivo:** `app/(user)/request/[providerId]/RequestForm.tsx`  
**Problema:** Se llamaba `navigator.geolocation.getCurrentPosition()` sin comprobar si `navigator.geolocation` existe (puede no existir en ciertos browsers o HTTP no seguro). El callback de error era genérico y no distinguía "permiso denegado" de "posición no disponible".  
**Fix:** Añadida verificación de disponibilidad y diferenciación del código de error.

---

### 8. `PaymentClient` — non-null assertion en href
**Severidad:** Medio  
**Archivo:** `app/(user)/pay/[requestId]/PaymentClient.tsx`  
**Problema:** `<a href={initPoint!}>` usaba `!` para suprimir el error de TypeScript. Si `initPoint` era null (fetch fallido sin error de red), el href quedaba como `null` y el botón no hacía nada al clickar.  
**Fix:** Añadido guard explícito: si `!initPoint` después de cargar, mostrar mensaje de error en lugar del botón.

---

### 9. Webhook — actualizaciones de BD sin verificar errores
**Severidad:** Crítico  
**Archivo:** `app/api/webhooks/mercadopago/route.ts`  
**Problema:** Los `await supabase.from(...).update(...)` se ejecutaban sin destructurar ni verificar `error`. Si alguna actualización fallaba (payments → PAID o service_requests → IN_PROGRESS), el webhook devolvía 200 igualmente, dejando la BD inconsistente: el usuario habría pagado pero el servicio seguiría en ACCEPTED.  
**Fix:** Añadida verificación de error en cada update crítico. Los updates de notificaciones loguean el error pero no detienen el flujo (no son críticos para la consistencia del pago).

---

### 10. `create-preference` — sin manejo de error de la API de MercadoPago
**Severidad:** Alto  
**Archivo:** `app/api/mercadopago/create-preference/route.ts`  
**Problema:** `preference.create()` se llamaba sin try/catch. Si la API de MP caía o devolvía error, la excepción no capturada devolvía un 500 genérico sin mensaje útil. El `payments.upsert()` tampoco verificaba el resultado.  
**Fix:** `preference.create()` envuelto en try/catch con respuesta 502 descriptiva. `upsert` verifica error y devuelve 500 si falla.

---

### 11. `TrackingClient` — geolocalización sin callback de error
**Severidad:** Medio  
**Archivo:** `app/(user)/tracking/[serviceId]/TrackingClient.tsx`  
**Problema:** El intervalo que transmite la ubicación del proveedor llamaba a `getCurrentPosition(successFn)` sin segundo argumento (callback de error). Si el permiso estaba denegado o la posición no disponible, fallaba silenciosamente y el mapa nunca actualizaba la posición. Además, si el componente se desmontaba durante el callback async, el `upsert` se ejecutaba igual.  
**Fix:** Añadido callback de error con log. Si `PERMISSION_DENIED`, se cancela el intervalo automáticamente. Añadida flag `cleanedUp` para evitar el upsert tras desmontar.

---

### 12. `NotificationsClient` — markAllRead sin catch
**Severidad:** Medio  
**Archivo:** `app/(user)/notifications/NotificationsClient.tsx`  
**Problema:** `markAllRead()` era llamada sin `.catch()`. Si lanzaba excepción, quedaba como unhandled rejection. Además, el estado local se actualizaba independientemente del resultado del update en BD.  
**Fix:** Añadido `.catch()`. El estado local (marcar como leído + resetear badge) ahora solo se actualiza si el update de BD fue exitoso.

---

## Pendiente tras la auditoría

Ver [`PENDIENTE.md`](./PENDIENTE.md).
