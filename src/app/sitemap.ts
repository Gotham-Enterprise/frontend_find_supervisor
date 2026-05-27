import type { MetadataRoute } from 'next'

import { fetchAllPublicSupervisorIds } from '@/lib/api/public-supervisors'
import { SITE_URL } from '@/lib/seo/config'
import {
  stateAbbreviationToSlug,
  SUPERVISOR_TYPE_PAGE_SLUGS,
  TOP_LICENSE_SLUGS_FOR_STATE,
  US_STATES,
} from '@/lib/seo/routes'

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

/**
 * Supervisor-type × state pSEO pages.
 * e.g. /supervisors/texas/collaborating-physicians
 * 51 states × 3 supervisor types = 153 URLs
 */
const SUPERVISOR_TYPE_STATE_PAGES: MetadataRoute.Sitemap = Object.keys(US_STATES).flatMap(
  (stateSlug) =>
    SUPERVISOR_TYPE_PAGE_SLUGS.map((typeSlug) => ({
      url: `${SITE_URL}/supervisors/${stateSlug}/${typeSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch public supervisor IDs for individual profile pages.
  // fetchAllPublicSupervisorIds never throws — returns [] on failure.
  const supervisorIds = await fetchAllPublicSupervisorIds()

  const supervisorPages: MetadataRoute.Sitemap = supervisorIds
    .filter(({ state }) => {
      // Only include supervisor profiles where we can resolve a valid state slug.
      // Profiles with missing or unrecognized state abbreviations are excluded
      // from the sitemap to avoid generating broken URLs.
      // TODO: Fix /supervisors/profile/[id] — no matching route exists. Public profiles
      // must be at /supervisors/[stateSlug]/[id]. Ensure supervisor data always includes
      // a valid state abbreviation to prevent sitemap exclusions.
      return Boolean(stateAbbreviationToSlug(state))
    })
    .map(({ id, state, updatedAt }) => {
      const stateSlug = stateAbbreviationToSlug(state)!
      return {
        url: `${SITE_URL}/supervisors/${stateSlug}/${id}`,
        lastModified: updatedAt ? new Date(updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

  return [
    ...STATIC_PAGES,
    ...STATE_PAGES,
    ...SUPERVISOR_TYPE_STATE_PAGES,
    ...LICENSE_STATE_PAGES,
    ...supervisorPages,
  ]
}
