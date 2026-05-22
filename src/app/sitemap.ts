import type { MetadataRoute } from 'next'

import { fetchAllPublicSupervisorIds } from '@/lib/api/public-supervisors'
import { SITE_URL } from '@/lib/seo/config'
import { stateAbbreviationToSlug, TOP_LICENSE_SLUGS_FOR_STATE, US_STATES } from '@/lib/seo/routes'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: `${SITE_URL}/supervisors`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/contact-us`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  },
]

/** State-level pSEO pages — one per US state. */
const STATE_PAGES: MetadataRoute.Sitemap = Object.keys(US_STATES).map((stateSlug) => ({
  url: `${SITE_URL}/supervisors/${stateSlug}`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}))

/** License-type + state pSEO pages — top license types only. */
const LICENSE_STATE_PAGES: MetadataRoute.Sitemap = Object.keys(US_STATES).flatMap((stateSlug) =>
  TOP_LICENSE_SLUGS_FOR_STATE.map((licenseSlug) => ({
    url: `${SITE_URL}/supervisors/${stateSlug}/${licenseSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })),
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch public supervisor IDs for individual profile pages.
  // fetchAllPublicSupervisorIds never throws — returns [] on failure.
  const supervisorIds = await fetchAllPublicSupervisorIds()

  const supervisorPages: MetadataRoute.Sitemap = supervisorIds.map(({ id, state, updatedAt }) => {
    // Build /supervisors/[stateSlug]/[id] — fall back to /supervisors/profile/[id]
    // if we can't resolve the state abbreviation to a slug.
    const stateSlug = stateAbbreviationToSlug(state)
    const url = stateSlug
      ? `${SITE_URL}/supervisors/${stateSlug}/${id}`
      : `${SITE_URL}/supervisors/profile/${id}`
    return {
      url,
      lastModified: updatedAt ? new Date(updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  return [...STATIC_PAGES, ...STATE_PAGES, ...LICENSE_STATE_PAGES, ...supervisorPages]
}
