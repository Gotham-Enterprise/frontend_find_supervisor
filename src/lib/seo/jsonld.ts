import { canonicalUrl, SITE_NAME, SITE_URL } from './config'
import { stateAbbreviationToSlug } from './routes'

// ---------------------------------------------------------------------------
// Types (minimal — we build plain objects so Next.js can serialize them)
// ---------------------------------------------------------------------------

export interface JsonLdObject {
  '@context': 'https://schema.org'
  '@type': string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Website / Organization schemas (homepage)
// ---------------------------------------------------------------------------

export function generateWebSiteJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Find licensed healthcare supervisors, collaborating physicians, and supervising physicians by state, specialty, occupation, and supervision format.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/supervisors?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationJsonLd(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'The leading platform for connecting healthcare professionals with licensed supervisors, collaborating physicians, and supervising physicians.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/contact`,
    },
  }
}

// ---------------------------------------------------------------------------
// Supervisor Person schema
// ---------------------------------------------------------------------------

interface SupervisorJsonLdInput {
  id: string
  fullName: string | null
  city?: string | null
  state?: string | null
  licenseType?: string | null
  /** Supervisor type name from the hierarchy (e.g. "Collaborating Physician", "Supervising Physician", "Mental Health Counselors"). */
  supervisorType?: string | null
  specialty?: string | null
  bio?: string | null
  profilePhotoUrl?: string | null
  website?: string | null
  yearsOfExperience?: string | null
  /** AggregateRating — only include when there are REAL reviews. */
  rating?: {
    ratingValue: number
    reviewCount: number
  } | null
}

/** Resolves the jobTitle for JSON-LD based on supervisor type and license type. */
function resolveJobTitle(supervisorType?: string | null, licenseType?: string | null): string {
  if (supervisorType === 'Collaborating Physician') return 'Collaborating Physician'
  if (supervisorType === 'Supervising Physician') return 'Supervising Physician'
  return [licenseType, 'Supervisor'].filter(Boolean).join(' ') || 'Supervisor'
}

export function generateSupervisorJsonLd(supervisor: SupervisorJsonLdInput): JsonLdObject {
  const stateSlug = supervisor.state ? stateAbbreviationToSlug(supervisor.state) : null
  const profileUrl = stateSlug
    ? canonicalUrl(`/supervisors/${stateSlug}/${supervisor.id}`)
    : canonicalUrl(`/supervisors/${supervisor.id}`)

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: supervisor.fullName ?? 'Supervisor',
    url: profileUrl,
    jobTitle: resolveJobTitle(supervisor.supervisorType, supervisor.licenseType),
    description: supervisor.bio ?? undefined,
  }

  if (supervisor.profilePhotoUrl) {
    schema.image = supervisor.profilePhotoUrl
  }

  if (supervisor.city || supervisor.state) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: supervisor.city ?? undefined,
      addressRegion: supervisor.state ?? undefined,
      addressCountry: 'US',
    }
  }

  if (supervisor.website) {
    schema.sameAs = [supervisor.website]
  }

  // Only add AggregateRating when we have real data
  if (supervisor.rating && supervisor.rating.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: supervisor.rating.ratingValue,
      reviewCount: supervisor.rating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

// ---------------------------------------------------------------------------
// BreadcrumbList schema
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string
  href: string
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.href),
    })),
  }
}

// ---------------------------------------------------------------------------
// FAQPage schema
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string
  answer: string
}

export function generateFaqJsonLd(faqs: FaqItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
