/**
 * Route classification helpers for robots.ts and noindex logic.
 * Add new private route prefixes here as the app grows.
 */

/** Prefixes that must NEVER be indexed (auth-required, user-private). */
export const PRIVATE_ROUTE_PREFIXES = [
  '/dashboard',
  '/settings',
  '/messages',
  '/billing',
  '/checkout',
  '/subscription',
  '/supervisee',
  '/supervisor/dashboard',
  '/my-profile',
  '/hired-supervisors',
  '/supervision-requests',
  '/supervisees',
  '/reviews',
  '/verification-guide',
  '/user/',
  '/api/',
] as const

/** Auth flow routes — noindex (search engines shouldn't index login/signup). */
export const AUTH_ROUTE_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-email',
  '/forgot-password',
  '/reset-password',
  '/email-verification',
] as const

/** Public routes that SHOULD be indexed. */
export const PUBLIC_INDEXABLE_ROUTES = ['/', '/supervisors', '/contact', '/contact-us'] as const

/** Returns true if the given pathname belongs to a private/auth-only section. */
export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

/** Returns true if the given pathname is an auth flow page (login, signup, etc.). */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

// ---------------------------------------------------------------------------
// US state slug / abbreviation maps (used for pSEO pages)
// ---------------------------------------------------------------------------

export const US_STATES: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new-hampshire': 'NH',
  'new-jersey': 'NJ',
  'new-mexico': 'NM',
  'new-york': 'NY',
  'north-carolina': 'NC',
  'north-dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode-island': 'RI',
  'south-carolina': 'SC',
  'south-dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west-virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district-of-columbia': 'DC',
}

/** Reverse map: abbreviation → slug (e.g. "CA" → "california"). Built once at module load. */
export const STATE_ABBREVIATION_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATES).map(([slug, abbr]) => [abbr, slug]),
)

/**
 * Converts a 2-letter state abbreviation to its URL slug.
 * e.g. "CA" → "california", "NY" → "new-york"
 * Returns null if the abbreviation is unknown.
 */
export function stateAbbreviationToSlug(abbreviation: string): string | null {
  return STATE_ABBREVIATION_TO_SLUG[abbreviation.toUpperCase()] ?? null
}

/** Returns true if the string looks like a UUID (supervisor ID). */
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/** Converts a slug like "new-york" to a display name like "New York". */
export function stateSlugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Converts a slug to its 2-letter abbreviation, or null if unknown. */
export function stateSlugToAbbreviation(slug: string): string | null {
  return US_STATES[slug.toLowerCase()] ?? null
}

/** Returns true if the slug corresponds to a valid US state. */
export function isValidStateSlug(slug: string): boolean {
  return slug.toLowerCase() in US_STATES
}

// ---------------------------------------------------------------------------
// License type slugs (pSEO)
// ---------------------------------------------------------------------------

/** Maps URL slugs to human-readable license type labels. */
export const LICENSE_TYPE_SLUGS: Record<string, string> = {
  lcsw: 'LCSW',
  lmft: 'LMFT',
  lpc: 'LPC',
  lmhc: 'LMHC',
  lpcc: 'LPCC',
  lcpc: 'LCPC',
  lmsw: 'LMSW',
  mft: 'MFT',
  mhc: 'MHC',
  mft_associate: 'MFT Associate',
  acsw: 'ACSW',
  lpc_associate: 'LPC Associate',
  lcsw_associate: 'LCSW Associate',
  lmhc_associate: 'LMHC Associate',
  licensed_psychologist: 'Licensed Psychologist',
  licensed_clinical_psychologist: 'Licensed Clinical Psychologist',
  licensed_counselor: 'Licensed Counselor',
}

/** Converts a license slug to its display label. Returns the uppercased slug as fallback. */
export function licenseSlugToLabel(slug: string): string {
  return LICENSE_TYPE_SLUGS[slug.toLowerCase()] ?? slug.toUpperCase().replace(/-/g, ' ')
}

/** Returns true if the slug is a known license type. */
export function isValidLicenseSlug(slug: string): boolean {
  return slug.toLowerCase() in LICENSE_TYPE_SLUGS
}

/**
 * Highest-value license type slugs for pSEO state pages.
 * These drive the quick-link nav on /supervisors/[state] pages.
 */
export const TOP_LICENSE_SLUGS_FOR_STATE = [
  'lcsw',
  'lmft',
  'lpc',
  'lmhc',
  'lpcc',
  'lcpc',
  'lmsw',
] as const

export type TopLicenseSlug = (typeof TOP_LICENSE_SLUGS_FOR_STATE)[number]
