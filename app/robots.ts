import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lokro.app'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/home', '/provider/', '/admin/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
