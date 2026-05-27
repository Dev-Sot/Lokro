import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de uso de Lokro.',
}

const LAST_UPDATED = '27 de mayo de 2026'

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Términos y condiciones</h1>
      <p className="text-muted-foreground text-sm mb-10">Última actualización: {LAST_UPDATED}</p>

      <div className="prose prose-slate max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Aceptación de los términos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Al acceder y usar la plataforma Lokro (lokro.co), aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no debes usar la plataforma. Lokro se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios a través de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Descripción del servicio</h2>
          <p className="text-muted-foreground leading-relaxed">
            Lokro es una plataforma de intermediación que conecta a usuarios que requieren servicios del hogar o profesionales con prestadores de servicios independientes. Lokro <strong className="text-foreground">no es empleador</strong> de los prestadores y no garantiza la disponibilidad, calidad ni resultado de ningún servicio. Los prestadores actúan como contratistas independientes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Registro y cuenta</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para usar Lokro debes registrar una cuenta con información veraz y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos inmediatamente si sospechas un acceso no autorizado.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-muted-foreground">
            <li>Debes tener al menos 18 años para registrarte.</li>
            <li>No puedes crear cuentas en nombre de otra persona sin su autorización.</li>
            <li>Lokro puede suspender o eliminar cuentas que violen estos términos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Pagos y comisiones</h2>
          <p className="text-muted-foreground leading-relaxed">
            Los pagos se procesan a través de Mercado Pago. Lokro cobra una <strong className="text-foreground">comisión del 10%</strong> sobre el valor de cada servicio completado, descontada automáticamente del pago al prestador. Los precios se muestran en pesos colombianos (COP) e incluyen IVA cuando aplique.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Las cancelaciones realizadas con más de 24 horas de anticipación son gratuitas. Cancelaciones tardías pueden estar sujetas a penalidades según lo acordado entre las partes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Responsabilidades del usuario</h2>
          <p className="text-muted-foreground leading-relaxed">
            Al usar Lokro, te comprometes a:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-muted-foreground">
            <li>No usar la plataforma para actividades ilegales o fraudulentas.</li>
            <li>No publicar información falsa, engañosa o inapropiada.</li>
            <li>No contactar a otros usuarios fuera de la plataforma para evadir comisiones.</li>
            <li>Tratar a los prestadores con respeto y profesionalismo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Responsabilidades del prestador</h2>
          <p className="text-muted-foreground leading-relaxed">
            Los prestadores registrados en Lokro declaran que cuentan con las competencias, licencias y permisos necesarios para ofrecer sus servicios. Son responsables de cumplir con la legislación colombiana aplicable a su actividad, incluyendo obligaciones tributarias.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitación de responsabilidad</h2>
          <p className="text-muted-foreground leading-relaxed">
            Lokro actúa únicamente como intermediario. No nos hacemos responsables por daños, pérdidas o perjuicios derivados de los servicios prestados por terceros a través de la plataforma. La responsabilidad máxima de Lokro ante cualquier reclamación se limita al valor de la transacción involucrada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Ley aplicable</h2>
          <p className="text-muted-foreground leading-relaxed">
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de Bogotá D.C., Colombia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
          <p className="text-muted-foreground leading-relaxed">
            Para consultas sobre estos términos puedes escribirnos a <strong className="text-foreground">legal@lokro.co</strong>.
          </p>
        </section>

      </div>
    </div>
  )
}
