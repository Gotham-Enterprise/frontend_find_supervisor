import './globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import { Providers } from '@/app/providers'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TITLE_TEMPLATE,
} from '@/lib/seo/config'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Healthcare Supervisor Marketplace`,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'healthcare supervisor',
    'licensed supervisor',
    'collaborating physician',
    'supervising physician',
    'clinical supervision',
    'find a supervisor',
    'LCSW supervisor',
    'LMFT supervisor',
    'LPC supervisor',
    'nurse practitioner collaboration',
    'physician assistant supervision',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Healthcare Supervisor Marketplace`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Find licensed healthcare Supervisors, Collaborating Physicians, and Supervising Physicians`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Healthcare Supervisor Marketplace`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Pre-paint guard for landing-page hash links (/#features etc.): hides the body
 * until ScrollToHash has positioned the section, so the visitor never sees the
 * top of the page flash before the jump. The timeout is a safety net that
 * reveals the page even if the section never renders.
 */
const HASH_SCROLL_GUARD = `
if (location.pathname === '/' && location.hash.length > 1) {
  document.documentElement.setAttribute('data-hash-scroll-pending', '');
  setTimeout(function () {
    document.documentElement.removeAttribute('data-hash-scroll-pending');
  }, 3000);
}
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <head>
        <style>{`html[data-hash-scroll-pending] body { visibility: hidden; }`}</style>
        <script dangerouslySetInnerHTML={{ __html: HASH_SCROLL_GUARD }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
