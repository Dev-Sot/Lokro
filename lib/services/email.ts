import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'Lokro <noreply@lokro.app>'
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lokro.app'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">
        <tr><td style="background:#18181b;padding:20px 32px">
          <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">Lokro</span>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b">${title}</h1>
          ${body}
          <hr style="border:none;border-top:1px solid #f4f4f5;margin:28px 0">
          <p style="margin:0;font-size:12px;color:#a1a1aa">Este mensaje fue enviado automáticamente por Lokro. No respondas a este correo.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#18181b;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">${label}</a>`
}

function p(text: string) {
  return `<p style="margin:0 0 12px;font-size:15px;color:#3f3f46;line-height:1.6">${text}</p>`
}

export async function sendRequestAcceptedEmail({
  toEmail,
  toName,
  providerName,
  requestId,
}: {
  toEmail: string
  toName: string
  providerName: string
  requestId: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const body = `
    ${p(`Hola ${esc(toName)},`)}
    ${p(`<strong>${esc(providerName)}</strong> aceptó tu solicitud de servicio. Ya puedes coordinarte con él directamente desde el chat.`)}
    ${btn(`${APP_URL}/chat/${requestId}`, 'Ir al chat')}
  `
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `${esc(providerName)} aceptó tu solicitud — Lokro`,
    html: baseTemplate('¡Tu solicitud fue aceptada!', body),
  })
}

export async function sendPaymentReceivedEmail({
  toEmail,
  toName,
  clientName,
  amount,
  requestId,
}: {
  toEmail: string
  toName: string
  clientName: string
  amount: number
  requestId: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
  const body = `
    ${p(`Hola ${esc(toName)},`)}
    ${p(`<strong>${esc(clientName)}</strong> realizó el pago de <strong>${formatted}</strong> por tu servicio. Ya puedes comenzar el trabajo.`)}
    ${btn(`${APP_URL}/chat/${requestId}`, 'Ver solicitud')}
  `
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Recibiste un pago de ${esc(clientName)} — Lokro`,
    html: baseTemplate('Pago confirmado', body),
  })
}

export async function sendServiceCompletedEmail({
  toEmail,
  toName,
  providerName,
  requestId,
}: {
  toEmail: string
  toName: string
  providerName: string
  requestId: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const body = `
    ${p(`Hola ${esc(toName)},`)}
    ${p(`<strong>${esc(providerName)}</strong> marcó tu servicio como completado. ¿Cómo te fue? Deja una reseña para ayudar a otros usuarios.`)}
    ${btn(`${APP_URL}/chat/${requestId}`, 'Dejar reseña')}
  `
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `Tu servicio fue completado — Lokro`,
    html: baseTemplate('Servicio completado', body),
  })
}
