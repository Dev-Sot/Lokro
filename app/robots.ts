import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lokro.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/providers/'],
        disallow: [
          '/home',
          '/explore',
          '/chat/',
          '/pay/',
          '/tracking/',
          '/notifications',
          '/profile',
          '/dashboard',
          '/requests',
          '/schedule',
          '/earnings',
          '/panel/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
