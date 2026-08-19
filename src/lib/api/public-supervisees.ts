/**
 * Public (unauthenticated) supervisee data fetching.
 *
 * Uses native fetch instead of the auth-cookie axios client so these calls
 * can be made safely from Next.js server components without a user session.
 *
 * Backend endpoint:
 *  - GET /supervision/supervisee/public-search — paginated browse with filters.
 *    Names arrive already masked server-side ("First L") and the payload never
 *    contains contact details, so rows can be rendered for guests as-is.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublicSuperviseeSummary {
  id: string
  /** Masked server-side to first name + last initial, e.g. "Maria S". */
  fullName: string
  city: string
  state: string
  /** "City, ST" convenience string built by the backend. */
  location: string
  profilePhotoUrl: string | null
  occupation: string
  specialty: string
  /** License/credential in progress, e.g. "AMFT", "LPC-Associate". */
  title: string
  /** "VIRTUAL" | "IN_PERSON" | "HYBRID" | "" */
  preferredFormat: string
  /** Timeline enum, e.g. "IMMEDIATELY", "WITHIN_2_WEEKS". */
  howSoonLooking: string
  /** Supervisor types they need, e.g. ["Mental Health Counselors"]. */
  typeOfSupervisorNeeded: string[]
  stateTheyAreLookingIn: string[]
  /** Truncated `idealSupervisor` free text — what they want in a supervisor. */
  bio: string
  /** "PER_SESSION" | "MONTHLY" | "" */
  budgetRangeType: string
  /** Whole dollars (not cents). */
  budgetRangeStart: number | null
  budgetRangeEnd: number | null
}

export interface PublicSuperviseeSearchMeta {
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
}

export interface PublicSuperviseeSearchResult {
  supervisees: PublicSuperviseeSummary[]
  meta: PublicSuperviseeSearchMeta
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function parseRow(row: Record<string, unknown>): PublicSuperviseeSummary {
  const city = String(row.city ?? '')
  const state = String(row.state ?? '')

  return {
    id: String(row.id ?? ''),
    fullName: String(row.fullName ?? ''),
    city,
    state,
    location: String(row.location ?? '').trim() || [city, state].filter(Boolean).join(', '),
    profilePhotoUrl: row.profilePhotoUrl ? String(row.profilePhotoUrl) : null,
    occupation: String(row.occupation ?? ''),
    specialty: String(row.specialty ?? ''),
    title: String(row.title ?? ''),
    preferredFormat: String(row.preferredFormat ?? ''),
    howSoonLooking: String(row.howSoonLooking ?? ''),
    typeOfSupervisorNeeded: Array.isArray(row.typeOfSupervisorNeeded)
      ? (row.typeOfSupervisorNeeded as string[])
      : [],
    stateTheyAreLookingIn: Array.isArray(row.stateTheyAreLookingIn)
      ? (row.stateTheyAreLookingIn as string[])
      : [],
    bio: String(row.idealSupervisor ?? '').trim(),
    budgetRangeType: String(row.budgetRangeType ?? ''),
    budgetRangeStart: row.budgetRangeStart == null ? null : Number(row.budgetRangeStart),
    budgetRangeEnd: row.budgetRangeEnd == null ? null : Number(row.budgetRangeEnd),
  }
}

export type PublicSuperviseeSearchParams = {
  /** State abbreviation (e.g. "CA") matched against stateTheyAreLookingIn. */
  state?: string
  /** Full state name (e.g. "California") sent alongside the abbreviation as a fallback,
   *  in case some supervisees saved full state names during signup. */
  stateFullName?: string
  /** Preferred format: "VIRTUAL" | "IN_PERSON" | "HYBRID" */
  preferredFormat?: string
  /** Occupation name filter (comma-separated accepted by the backend). */
  occupation?: string
  /** Specialty name filter (comma-separated accepted by the backend). */
  specialty?: string
  /** Free-text keyword search (city, occupation, specialty, title, bio). */
  keywords?: string
  page?: number
  limit?: number
}

// ---------------------------------------------------------------------------
// Public search fetch (server-safe)
// ---------------------------------------------------------------------------

/**
 * Fetches supervisees using the public browse endpoint.
 * Safe to call from Server Components and generateMetadata.
 * Returns an empty result on any error — never throws.
 */
export async function fetchPublicSupervisees(
  params: PublicSuperviseeSearchParams = {},
): Promise<PublicSuperviseeSearchResult> {
  try {
    const query = new URLSearchParams()
    if (params.state) {
      // Send both the abbreviation (e.g. "CA") and the full name (e.g. "California")
      // so results appear regardless of which format was saved during signup.
      // The backend normalizeArray + hasSome handles comma-separated values.
      const abbr = params.state
      const fullName = params.stateFullName ?? abbr
      const stateParam = abbr === fullName ? abbr : `${abbr},${fullName}`
      query.set('state', stateParam)
    }
    if (params.preferredFormat) query.set('format', params.preferredFormat)
    if (params.occupation) query.set('occupation', params.occupation)
    if (params.specialty) query.set('specialty', params.specialty)
    if (params.keywords?.trim()) query.set('keywords', params.keywords.trim())
    query.set('page', String(params.page ?? 1))
    query.set('limit', String(params.limit ?? 12))

    const url = `${API_BASE_URL}/supervision/supervisee/public-search?${query.toString()}`

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      console.warn(`[public-supervisees] Search returned ${res.status} for params:`, params)
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
      supervisees: rows.map((row) => parseRow(row as Record<string, unknown>)),
      meta: {
        totalCount: Number(meta.totalCount ?? rows.length),
        totalPages: Number(meta.totalPages ?? 1),
        currentPage: Number(meta.page ?? 1),
        hasNextPage: Boolean(meta.hasNextPage ?? false),
      },
    }
  } catch (err) {
    console.error('[public-supervisees] fetchPublicSupervisees error:', err)
    return emptyResult()
  }
}

function emptyResult(): PublicSuperviseeSearchResult {
  return {
    supervisees: [],
    meta: { totalCount: 0, totalPages: 0, currentPage: 1, hasNextPage: false },
  }
}
