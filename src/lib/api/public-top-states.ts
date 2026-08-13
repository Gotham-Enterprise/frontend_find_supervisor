/**
 * Public (unauthenticated) top-states data for the footer links.
 *
 * Uses native fetch (not the auth-cookie axios client) so it can be called
 * from server components. Returns only states that actually have publicly
 * visible members — empty arrays mean no state links should be shown.
 *
 * Backend endpoint:
 *  - GET /supervision/public/top-states?limit=N
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'

export interface TopStateEntry {
  /** Two-letter state abbreviation, e.g. "CA". */
  state: string
  count: number
}

export interface PublicTopStates {
  supervisors: TopStateEntry[]
  supervisees: TopStateEntry[]
}

function parseEntries(raw: unknown): TopStateEntry[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      const row = entry as Record<string, unknown>
      return { state: String(row.state ?? ''), count: Number(row.count ?? 0) }
    })
    .filter((entry) => entry.state && entry.count > 0)
}

/**
 * Fetches the states with the most publicly visible Supervisors and
 * Supervisees. Returns empty lists on any error — never throws.
 */
export async function fetchPublicTopStates(limit = 4): Promise<PublicTopStates> {
  try {
    const res = await fetch(`${API_BASE_URL}/supervision/public/top-states?limit=${limit}`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      console.warn(`[public-top-states] Returned ${res.status}`)
      return { supervisors: [], supervisees: [] }
    }

    const json = (await res.json()) as {
      success?: boolean
      data?: { supervisors?: unknown; supervisees?: unknown }
    }

    return {
      supervisors: parseEntries(json.data?.supervisors),
      supervisees: parseEntries(json.data?.supervisees),
    }
  } catch (err) {
    console.error('[public-top-states] fetchPublicTopStates error:', err)
    return { supervisors: [], supervisees: [] }
  }
}
