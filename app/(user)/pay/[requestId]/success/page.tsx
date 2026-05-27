import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock } from 'lucide-react'
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
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center bg-green-100">
        {isPending ? (
          <Clock size={40} className="text-amber-500" />
        ) : (
          <CheckCircle2 size={40} className="text-green-600" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {isPending ? 'Pago en proceso' : '¡Pago exitoso!'}
        </h1>
        <p className="text-muted-foreground">
          {isPending
            ? 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.'
            : 'Tu pago fue confirmado. El prestador ha sido notificado y está en camino.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button asChild>
          <Link href={`/chat/${requestId}`}>Ver chat del servicio</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/home">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}