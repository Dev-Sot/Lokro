import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', authUser.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Not a provider' }, { status: 403 })
  }

  const { data: requestIds } = await supabase
    .from('service_requests')
    .select('id')
    .eq('provider_id', profile.id)

  const ids = requestIds?.map((r) => r.id) ?? []

  if (ids.length === 0) {
    const csv = 'Fecha,Categoria,Descripcion,Total cobrado,Comision plataforma,Ingreso neto\n'
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ingresos-lokro.csv"',
      },
    })
  }

  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      amount, platform_fee, provider_amount, created_at,
      request:service_requests(description, category:categories(name))
    `)
    .eq('status', 'PAID')
    .in('request_id', ids)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`

  const header = 'Fecha,Categoria,Descripcion,Total cobrado,Comision plataforma,Ingreso neto'
  const rows = (payments ?? []).map((p) => {
    const req = p.request as unknown as { description: string; category: { name: string } } | null
    const fecha = new Date(p.created_at).toLocaleDateString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    return [
      escape(fecha),
      escape(req?.category?.name ?? ''),
      escape(req?.description ?? ''),
      p.amount,
      p.platform_fee,
      p.provider_amount,
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ingresos-lokro.csv"',
    },
  })
}
