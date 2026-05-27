import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lokro.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: providers } = await supabase
    .from('provider_profiles')
    .select('id, updated_at')
    .eq('available', true)
    .order('updated_at', { ascending: false })

  const providerRoutes: MetadataRoute.Sitemap = (providers ?? []).map((p) => ({
    url: `${BASE}/providers/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ]

  return [...staticRoutes, ...providerRoutes]
}
