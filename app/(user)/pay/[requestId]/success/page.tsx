import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, MessageCircle, Home, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Pago completado' }

interface Props {
  params: Promise<{ requestId: string }>
  searchParams: Promise<{ status?: string }>
}

export default async function PaySuccessPage({ params, searchParams }: Props) {
  const { requestId } = await params
  const { status } = await searchParams
  const isPending = status === 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 py-16">

        {/* Icon */}
        <div className="relative mx-auto w-fit">
          <div className={`h-28 w-28 rounded-full flex items-center justify-center mx-auto shadow-xl ${
            isPending
              ? 'bg-amber-50 border-4 border-amber-100'
              : 'bg-green-50 border-4 border-green-100'
          }`}>
            {isPending ? (
              <Clock size={52} className="text-amber-500" />
            ) : (
              <CheckCircle2 size={52} className="text-green-500" />
            )}
          </div>
          {/* Rings */}
          {!isPending && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-green-200 scale-125 opacity-40 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full border-2 border-green-100 scale-150 opacity-20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            </>
          )}
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">
            {isPending ? 'Pago en proceso' : '¡Pago exitoso!'}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isPending
              ? 'Tu pago está siendo procesado. Recibirás una notificación y un email cuando se confirme.'
              : 'Tu pago fue confirmado. El prestador ha sido notificado y ya puede coordinar el servicio contigo.'}
          </p>
        </div>

        {/* What's next */}
        {!isPending && (
          <div className="rounded-2xl border bg-card p-5 text-left space-y-3">
            <p className="text-sm font-semibold">¿Qué sigue?</p>
            {[
              'El prestador recibió la notificación de pago',
              'Coordina los detalles finales por el chat',
              'Al finalizar el servicio, deja tu reseña',
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1 gap-2">
            <Link href={`/chat/${requestId}`}>
              <MessageCircle size={18} />
              Ir al chat
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="flex-1 gap-2">
            <Link href="/home">
              <Home size={18} />
              Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
