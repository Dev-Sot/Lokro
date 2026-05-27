import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y tratamiento de datos personales de Lokro.',
}

const LAST_UPDATED = '27 de mayo de 2026'

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Política de privacidad</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: {LAST_UPDATED}</p>

      <div className="space-y-8 text-foreground">

        <div className="rounded-xl border bg-blue-50 border-blue-200 p-5">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Base legal:</strong> Esta política cumple con la <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales) y el <strong>Decreto 1377 de 2013</strong> de la República de Colombia. Al usar Lokro autorizas el tratamiento de tus datos conforme a lo aquí descrito.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Responsable del tratamiento</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Lokro</strong> es responsable del tratamiento de los datos personales recolectados a través de la plataforma lokro.co. Para ejercer tus derechos puedes contactarnos en <strong className="text-foreground">privacidad@lokro.co</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Datos que recolectamos</h2>
          <div className="space-y-3">
            {[
              { title: 'Datos de registro', desc: 'Nombre completo, dirección de correo electrónico, contraseña cifrada y rol en la plataforma (usuario o prestador).' },
              { title: 'Datos de perfil', desc: 'Foto de perfil, descripción profesional, tarifa por hora, especialidades y ubicación geográfica aproximada.' },
              { title: 'Datos de uso', desc: 'Solicitudes de servicio, mensajes de chat, historial de pagos, calificaciones y reseñas.' },
              { title: 'Datos de ubicación', desc: 'Coordenadas GPS durante la prestación del servicio activo, solo cuando el prestador activa el seguimiento en tiempo real.' },
              { title: 'Datos técnicos', desc: 'Dirección IP, tipo de navegador y datos de sesión necesarios para el funcionamiento seguro de la plataforma.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">{title}:</strong> {desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Finalidad del tratamiento</h2>
          <p className="text-muted-foreground leading-relaxed">Usamos tus datos para:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-muted-foreground">
            <li>Crear y gestionar tu cuenta en la plataforma.</li>
            <li>Conectarte con prestadores de servicios cercanos a tu ubicación.</li>
            <li>Procesar pagos y emitir comprobantes de transacción.</li>
            <li>Enviar notificaciones relacionadas con tus solicitudes de servicio.</li>
            <li>Calcular calificaciones y reseñas de prestadores.</li>
            <li>Mejorar la plataforma mediante análisis de uso agregado y anónimo.</li>
            <li>Cumplir obligaciones legales y prevenir fraudes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Compartición de datos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Lokro no vende ni cede tus datos personales a terceros con fines comerciales. Compartimos datos únicamente con:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-muted-foreground">
            <li><strong className="text-foreground">Mercado Pago:</strong> Para procesar pagos de forma segura. Solo reciben la información necesaria para la transacción.</li>
            <li><strong className="text-foreground">Supabase:</strong> Proveedor de base de datos e infraestructura cloud donde se almacenan los datos bajo estándares de seguridad internacionales.</li>
            <li><strong className="text-foreground">Resend:</strong> Servicio de envío de correos electrónicos transaccionales.</li>
            <li><strong className="text-foreground">Autoridades competentes:</strong> Cuando sea requerido por ley o por orden judicial.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Tus derechos (Ley 1581/2012)</h2>
          <p className="text-muted-foreground leading-relaxed">Como titular de los datos tienes derecho a:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {[
              { r: 'Conocer', d: 'Saber qué datos tenemos sobre ti.' },
              { r: 'Actualizar', d: 'Corregir datos inexactos o incompletos.' },
              { r: 'Suprimir', d: 'Solicitar la eliminación de tus datos.' },
              { r: 'Revocar', d: 'Retirar tu autorización en cualquier momento.' },
            ].map(({ r, d }) => (
              <div key={r} className="rounded-lg border p-3">
                <p className="font-semibold text-sm">{r}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Para ejercer estos derechos escríbenos a <strong className="text-foreground">privacidad@lokro.co</strong>. Responderemos en un plazo máximo de 15 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Seguridad de los datos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (TLS), almacenamiento cifrado en reposo, políticas de acceso por rol (RLS) en la base de datos, y autenticación con tokens JWT en cookies seguras. El acceso a los datos está restringido al personal autorizado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Usamos cookies estrictamente necesarias para el funcionamiento de la sesión y la autenticación. No usamos cookies de rastreo publicitario ni compartimos datos de navegación con redes publicitarias. Puedes gestionar las cookies desde la configuración de tu navegador, aunque esto puede afectar el funcionamiento de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Retención de datos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Conservamos tus datos mientras tu cuenta esté activa. Al eliminar tu cuenta, tus datos personales son eliminados en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales o fiscales (máximo 5 años).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para cualquier consulta sobre esta política: <strong className="text-foreground">privacidad@lokro.co</strong>
          </p>
        </section>

      </div>
    </div>
  )
}
