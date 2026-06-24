/**
 * Public (unauthenticated) supervisor data fetching.
 *
 * Uses native fetch instead of the auth-cookie axios client so these calls
 * can be made safely from Next.js server components and sitemap/metadata
 * generators without requiring a user session.
 *
 * Two public backend endpoints are used:
 *  - GET /supervision/search          — paginated search with filters
 *  - GET /supervision/supervisor/public-profile?id=<uuid>  — single profile by ID
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'

// ---------------------------------------------------------------------------
// Types (subset of SupervisorSearchApiRow for public usage)
// ---------------------------------------------------------------------------

export interface PublicSupervisorSummary {
  id: string
  fullName: string
  city: string
  state: string
  licenseType: string
  supervisorType: string
  specialty: string
  /** Merged bio — professionalSummary if present, otherwise describeYourself. */
  bio: string
  professionalSummary: string | null
  describeYourself: string | null
  profilePhotoUrl: string | null
  yearsOfExperience: string
  acceptingSupervisees: boolean
  supervisionFormat: string
  stateOfLicensure: string[]
  certification: string[]
  /** Fee cadence, e.g. 'HOURLY' | 'MONTHLY' | 'PER_SESSION'. */
  supervisionFeeType: string | null
  /** Fee in whole dollars, e.g. 100 = $100. */
  supervisionFeeAmount: number | null
  updatedAt?: string
}

export interface PublicSupervisorSearchMeta {
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
}

export interface PublicSupervisorSearchResult {
  supervisors: PublicSupervisorSummary[]
  meta: PublicSupervisorSearchMeta
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Reads a fee column from the flat row or the nested `supervisorProfile` object. */
function readFeeField(row: Record<string, unknown>, key: string): unknown {
  if (row[key] != null) return row[key]
  const profile = row.supervisorProfile
  if (profile && typeof profile === 'object') {
    return (profile as Record<string, unknown>)[key]
  }
  return undefined
}

function parseFeeType(row: Record<string, unknown>): string | null {
  const raw = readFeeField(row, 'supervisionFeeType')
  if (raw == null || raw === '') return null
  // Normalize free-text variants (e.g. "hourly", "per session") to the
  // SCREAMING_SNAKE_CASE codes the fee formatters expect.
  return String(raw).trim().toUpperCase().replace(/\s+/g, '_')
}

function parseFeeAmount(row: Record<string, unknown>): number | null {
  const raw = readFeeField(row, 'supervisionFeeAmount')
  if (raw == null || raw === '') return null
  const amount = Number(raw)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

function parseRow(row: Record<string, unknown>): PublicSupervisorSummary {
  const professionalSummary = row.professionalSummary
    ? String(row.professionalSummary).trim()
    : null
  const describeYourself = row.describeYourself ? String(row.describeYourself).trim() : null
  // The dedicated profile endpoint returns a pre-merged `bio` field;
  // the search endpoint returns the raw columns — support both.
  const bio = row.bio ? String(row.bio).trim() : professionalSummary || describeYourself || ''

  return {
    id: String(row.id ?? ''),
    fullName: String(row.fullName ?? ''),
    city: String(row.city ?? ''),
    state: String(row.state ?? ''),
    licenseType: String(row.licenseType ?? ''),
    supervisorType: String(row.supervisorType ?? row.profession ?? ''),
    specialty: String(row.specialty ?? ''),
    bio,
    professionalSummary,
    describeYourself,
    profilePhotoUrl: (row.profilePhotoUrl as string | null) ?? null,
    yearsOfExperience: String(row.yearsOfExperience ?? ''),
    acceptingSupervisees: Boolean(row.acceptingSupervisees),
    supervisionFormat: String(row.supervisionFormat ?? ''),
    stateOfLicensure: Array.isArray(row.stateOfLicensure) ? (row.stateOfLicensure as string[]) : [],
    certification: Array.isArray(row.certification) ? (row.certification as string[]) : [],
    // The search endpoint nests fee fields under `supervisorProfile`; the
    // public-profile endpoint flattens them to the top level — support both.
    supervisionFeeType: parseFeeType(row),
    supervisionFeeAmount: parseFeeAmount(row),
    updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
  }
}

export type PublicSearchParams = {
  stateOfLicensure?: string
  /** Full state name (e.g. "California") sent alongside the abbreviation as a fallback,
   *  because some supervisors may have saved their state as a full name during signup. */
  stateFullName?: string
  licenseType?: string
  /** Supervisor type name from the hierarchy (e.g. "Collaborating Physician"). */
  supervisorType?: string
  /** Supervision format: "VIRTUAL" | "IN_PERSON" | "HYBRID" */
  supervisionFormat?: string
  /** City name for city-scoped searches. */
  city?: string
  /** Free-text keyword search (name, specialty, etc.). */
  keywords?: string
  page?: number
  limit?: number
}

// ---------------------------------------------------------------------------
// Public search fetch (server-safe)
// ---------------------------------------------------------------------------

/**
 * Fetches supervisors using the public search endpoint.
 * Safe to call from Server Components, generateMetadata, and sitemap.ts.
 * Returns an empty result on any error — never throws.
 */
export async function fetchPublicSupervisors(
  params: PublicSearchParams = {},
): Promise<PublicSupervisorSearchResult> {
  try {
    const query = new URLSearchParams()
    if (params.stateOfLicensure) {
      // Send both the abbreviation (e.g. "CA") and the full name (e.g. "California")
      // so results appear regardless of which format supervisors saved during signup.
      // The backend normalizeArray + hasSome handles comma-separated values.
      const abbr = params.stateOfLicensure
      const fullName = params.stateFullName ?? abbr
      const stateParam = abbr === fullName ? abbr : `${abbr},${fullName}`
      query.set('stateOfLicensure', stateParam)
    }
    if (params.licenseType) query.set('licenseType', params.licenseType)
    if (params.supervisorType) query.set('supervisorType', params.supervisorType)
    if (params.supervisionFormat) query.set('supervisionFormat', params.supervisionFormat)
    if (params.city?.trim()) query.set('city', params.city.trim())
    if (params.keywords?.trim()) query.set('keywords', params.keywords.trim())
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 20))
    // Always send acceptingSupervisees=true for public SEO pages.
    // The backend defaults this param to `false` when omitted, which would
    // incorrectly filter OUT supervisors who are accepting new supervisees.
    query.set('acceptingSupervisees', 'true')

    const url = `${API_BASE_URL}/supervision/search?${query.toString()}`

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      console.warn(`[public-supervisors] Search returned ${res.status} for params:`, params)
      return emptyResult()
    }

    const json = (await res.json()) as {
      success?: boolean
      data?: unknown[]
      metaData?: Record<string, unknown>
    }

    const rows = Array.isArray(json.data) ? json.data : []
    const meta = json.metaData ?? {}

    return {
      supervisors: rows.map((row) => parseRow(row as Record<string, unknown>)),
      meta: {
        totalCount: Number(meta.totalCount ?? rows.length),
        totalPages: Number(meta.totalPages ?? 1),
        currentPage: Number(meta.page ?? 1),
        hasNextPage: Boolean(meta.hasNextPage ?? false),
      },
    }
  } catch (err) {
    console.error('[public-supervisors] fetchPublicSupervisors error:', err)
    return emptyResult()
  }
}

/**
 * Fetches all supervisor IDs (and their states) for sitemap generation.
 * Iterates pages until exhausted; caps at 500 to prevent runaway requests.
 * Returns empty array on any error — never throws.
 */
export async function fetchAllPublicSupervisorIds(): Promise<
  Array<{ id: string; state: string; updatedAt?: string }>
> {
  const MAX_PAGES = 25 // 25 pages × 20 per page = 500 supervisors max for sitemap
  const results: Array<{ id: string; state: string; updatedAt?: string }> = []

  try {
    let page = 1
    let hasMore = true

    while (hasMore && page <= MAX_PAGES) {
      const { supervisors, meta } = await fetchPublicSupervisors({ page, limit: 20 })
      for (const s of supervisors) {
        results.push({ id: s.id, state: s.state, updatedAt: s.updatedAt })
      }
      hasMore = meta.hasNextPage
      page++
    }
  } catch (err) {
    console.error('[public-supervisors] fetchAllPublicSupervisorIds error:', err)
  }

  return results
}

/**
 * Fetches a single supervisor's public profile directly by UUID.
 * Uses the dedicated GET /supervision/supervisor/public-profile?id=<uuid> endpoint.
 * Returns null when the supervisor does not exist, is not approved/visible,
 * or on any network error — never throws.
 */
export async function fetchPublicSupervisorById(
  supervisorId: string,
): Promise<PublicSupervisorSummary | null> {
  try {
    const url = `${API_BASE_URL}/supervision/supervisor/public-profile?id=${encodeURIComponent(supervisorId)}`

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })

    if (res.status === 404) return null

    if (!res.ok) {
      console.warn(
        `[public-supervisors] public-profile returned ${res.status} for id: ${supervisorId}`,
      )
      return null
    }

    const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown> }

    if (!json.success || !json.data) return null

    return parseRow(json.data)
  } catch (err) {
    console.error('[public-supervisors] fetchPublicSupervisorById error:', err)
    return null
  }
}

function emptyResult(): PublicSupervisorSearchResult {
  return {
    supervisors: [],
    meta: { totalCount: 0, totalPages: 0, currentPage: 1, hasNextPage: false },
  }
}
