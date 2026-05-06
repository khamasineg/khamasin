import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/checkout',
        '/order-confirmed',
        '/account',
      ],
    },
    sitemap: 'www.fyndethevintage.com/sitemap.xml',
  }
}