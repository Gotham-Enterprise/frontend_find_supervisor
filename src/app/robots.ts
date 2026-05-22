import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/supervisors', '/supervisors/', '/contact', '/contact-us', '/faq'],
        disallow: [
          // Authenticated shell routes
          '/dashboard',
          '/settings',
          '/messages',
          '/billing',
          '/my-profile',
          '/hired-supervisors',
          '/supervision-requests',
          '/supervisees',
          '/reviews',
          '/verification-guide',
          '/user/',
          // Auth / account management flows
          '/login',
          '/signup',
          '/forgot-email',
          '/forgot-password',
          '/reset-password',
          '/email-verification',
          '/verify-email',
          // Checkout / payments
          '/checkout',
          // API routes
          '/api/',
          // Next.js internals
          '/_next/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
