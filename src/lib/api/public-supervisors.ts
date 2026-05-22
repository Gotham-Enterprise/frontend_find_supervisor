/**
 * Public (unauthenticated) supervisor data fetching.
 *
 * Uses native fetch instead of the auth-cookie axios client so these calls
 * can be made safely from Next.js server components and sitemap/metadata
 * generators without requiring a user session.
 *
 * The /supervision/search endpoint is public (no auth middleware on the backend).
 *
 * TODO (Backend): Add a dedicated public endpoint:
 *   GET /api/supervision/supervisor/public-profile?id=<id>
 *   This should return safe public fields only (no private contact info, no billing data)
 *   and must not require authentication. Until that endpoint exists, individual
 *   supervisor profile pages will use the search endpoint for metadata generation.
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
  bio: string
  profilePhotoUrl: string | null
  yearsOfExperience: string
  acceptingSupervisees: boolean
  supervisionFormat: string
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

function parseRow(row: Record<string, unknown>): PublicSupervisorSummary {
  const id = String(row.id ?? '')
  const fullName = String(row.fullName ?? '')
  return {
    id,
    fullName,
    city: String(row.city ?? ''),
    state: String(row.state ?? ''),
    licenseType: String(row.licenseType ?? ''),
    supervisorType: String(row.supervisorType ?? row.profession ?? ''),
    specialty: String(row.specialty ?? ''),
    bio: String(row.professionalSummary ?? row.describeYourself ?? '').trim(),
    profilePhotoUrl: (row.profilePhotoUrl as string | null) ?? null,
    yearsOfExperience: String(row.yearsOfExperience ?? ''),
    acceptingSupervisees: Boolean(row.acceptingSupervisees),
    supervisionFormat: String(row.supervisionFormat ?? ''),
  }
}

type SearchParams = {
  stateOfLicensure?: string
  /** Full state name (e.g. "California") sent alongside the abbreviation as a fallback,
   *  because some supervisors may have saved their state as a full name during signup. */
  stateFullName?: string
  licenseType?: string
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
  params: SearchParams = {},
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
        results.push({ id: s.id, state: s.state })
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
 * Finds a single supervisor by ID by searching within their state.
 * Paginates up to MAX_LOOKUP_PAGES pages to find the supervisor.
 * Returns null if not found or on any error — never throws.
 *
 * NOTE: This is a workaround until a dedicated public profile endpoint exists:
 *   TODO (Backend): GET /api/supervision/supervisor/public-profile?id=<id>
 */
export async function fetchPublicSupervisorById(
  supervisorId: string,
  stateAbbreviation: string,
): Promise<PublicSupervisorSummary | null> {
  const MAX_LOOKUP_PAGES = 10
  try {
    let page = 1
    let hasMore = true

    while (hasMore && page <= MAX_LOOKUP_PAGES) {
      const { supervisors, meta } = await fetchPublicSupervisors({
        stateOfLicensure: stateAbbreviation,
        page,
        limit: 20,
      })

      const match = supervisors.find((s) => s.id === supervisorId)
      if (match) return match

      hasMore = meta.hasNextPage
      page++
    }

    return null
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
