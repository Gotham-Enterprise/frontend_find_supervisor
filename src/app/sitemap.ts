import type { MetadataRoute } from 'next'

import { fetchAllPublicSupervisorIds } from '@/lib/api/public-supervisors'
import { SITE_URL } from '@/lib/seo/config'
import {
  MEDICAL_DIRECTORS_PATH,
  type PublicDirectoryPath,
  stateAbbreviationToSlug,
  SUPERVISOR_TYPE_PAGE_SLUGS,
  SUPERVISORS_PATH,
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
    url: `${SITE_URL}${MEDICAL_DIRECTORS_PATH}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/browse-supervisees`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
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

/** Medical Director state pSEO pages — one per US state (thin ones self-noindex). */
const MEDICAL_DIRECTOR_STATE_PAGES: MetadataRoute.Sitemap = Object.keys(US_STATES).map(
  (stateSlug) => ({
    url: `${SITE_URL}${MEDICAL_DIRECTORS_PATH}/${stateSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }),
)

/** Supervisee state pSEO pages — one per US state (thin ones self-noindex). */
const SUPERVISEE_STATE_PAGES: MetadataRoute.Sitemap = Object.keys(US_STATES).map((stateSlug) => ({
  url: `${SITE_URL}/browse-supervisees/${stateSlug}`,
  lastModified: new Date(),
  changeFrequency: 'weekly' as const,
  priority: 0.7,
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
 * 51 states × 3 supervisor types = 153 URLs (Medical Directors live under /medical-directors)
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

/**
 * Individual profile URLs for one public directory. Profiles with missing or
 * unrecognized state abbreviations are excluded (no canonical URL to list).
 */
function profilePages(
  directory: PublicDirectoryPath,
  ids: Array<{ id: string; state: string; updatedAt?: string }>,
): MetadataRoute.Sitemap {
  return ids.flatMap(({ id, state, updatedAt }) => {
    const stateSlug = stateAbbreviationToSlug(state)
    if (!stateSlug) return []
    return [
      {
        url: `${SITE_URL}${directory}/${stateSlug}/${id}`,
        lastModified: updatedAt ? new Date(updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ]
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Each directory is fetched with its own searchMode so every profile is
  // listed once, at its canonical URL. Never throws — returns [] on failure.
  const [supervisorIds, medicalDirectorIds] = await Promise.all([
    fetchAllPublicSupervisorIds('supervisors'),
    fetchAllPublicSupervisorIds('medicalDirectors'),
  ])

  // Supervisor mode still lists Medical Directors with a physician offering;
  // their canonical profile is under /medical-directors, so drop the overlap.
  const medicalDirectorIdSet = new Set(medicalDirectorIds.map(({ id }) => id))

  return [
    ...STATIC_PAGES,
    ...STATE_PAGES,
    ...MEDICAL_DIRECTOR_STATE_PAGES,
    ...SUPERVISEE_STATE_PAGES,
    ...SUPERVISOR_TYPE_STATE_PAGES,
    ...LICENSE_STATE_PAGES,
    ...profilePages(
      SUPERVISORS_PATH,
      supervisorIds.filter(({ id }) => !medicalDirectorIdSet.has(id)),
    ),
    ...profilePages(MEDICAL_DIRECTORS_PATH, medicalDirectorIds),
  ]
}
