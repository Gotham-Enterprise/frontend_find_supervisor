import type { Metadata } from 'next'

// ---------------------------------------------------------------------------
// Base constants
// ---------------------------------------------------------------------------

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://find-supervisor.gothamenterprisesltd.com'

export const SITE_NAME = 'Find A Supervisor'

export const DEFAULT_TITLE = 'Find A Supervisor | Healthcare Supervisor Marketplace'

export const DEFAULT_DESCRIPTION =
  'Find licensed healthcare supervisors, collaborating physicians, and supervising physicians by state, city, specialty, occupation, and supervision format. Connect with verified supervisors across all 50 states.'

export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

// ---------------------------------------------------------------------------
// Canonical URL helpers
// ---------------------------------------------------------------------------

/** Returns an absolute canonical URL for the given path (leading slash required). */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// ---------------------------------------------------------------------------
// Metadata factory
// ---------------------------------------------------------------------------

interface BuildMetadataOptions {
  title: string
  description?: string
  path: string
  /** Override Open Graph image. Falls back to DEFAULT_OG_IMAGE. */
  ogImage?: string
  /** Set to true for private/auth-only pages (dashboard, settings, billing, etc.). */
  noIndex?: boolean
  /** Additional Open Graph fields. */
  og?: Partial<NonNullable<Metadata['openGraph']>>
}

/**
 * Build a fully-typed Next.js Metadata object with canonical, OG, and Twitter
 * tags pre-filled. Merge with page-specific overrides as needed.
 */
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  og = {},
}: BuildMetadataOptions): Metadata {
  const canonical = canonicalUrl(path)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
      locale: 'en_US',
      ...og,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

// ---------------------------------------------------------------------------
// noIndex shorthand
// ---------------------------------------------------------------------------

/** Returns robots metadata that prevents indexing but still allows link-following. */
export const noIndexMetadata: Pick<Metadata, 'robots'> = {
  robots: { index: false, follow: true },
}
