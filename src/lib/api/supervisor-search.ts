import type {
  SortOption,
  SupervisionFormat,
  SupervisorSearchFilters,
  SupervisorSearchResult,
} from '@/components/SearchSupervisor/types'
import { formatSupervisorTypeLabel } from '@/lib/utils/profile-formatters'
import { getSupervisorDisplayCredential } from '@/lib/utils/supervisor-type'

import { apiClient } from './client'

const AVATAR_COLORS = [
  'bg-[#006d36]',
  'bg-[#2563eb]',
  'bg-[#7c3aed]',
  'bg-[#dc2626]',
  'bg-[#d97706]',
  'bg-[#0891b2]',
] as const

/** Raw row shape from GET /api/supervision/search (transformSupervisor). */
export interface SupervisorSearchApiRow {
  id: string | number
  fullName?: string
  city?: string
  state?: string
  location?: string
  licenseType?: string
  degreeType?: string
  supervisorType?: string
  profession?: string
  licenseNumber?: string
  stateLicense?: string
  yearsOfExperience?: string | number
  patientPopulation?: string[]
  supervisionFormat?: string
  availability?: string
  acceptingSupervisees?: boolean
  specialty?: string
  professionalSummary?: string
  describeYourself?: string
  profilePhotoUrl?: string
}

export interface SupervisorSearchMetaData {
  page: number
  limit: number
  totalPages: number
  totalCount: number
  currentPageTotalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SupervisorSearchApiResponse {
  success: boolean
  data: SupervisorSearchApiRow[]
  metaData: SupervisorSearchMetaData
}

export interface SupervisorSearchQueryInput {
  page: number
  limit: number
  keywords: string
  filters: SupervisorSearchFilters
  sortBy?: SortOption
}

function trimOrEmpty(s: string | undefined): string {
  return s?.trim() ?? ''
}

function appendCommaSeparated(
  params: Record<string, string | number | boolean>,
  key: string,
  values: string[],
) {
  const parts = values.map((v) => v.trim()).filter(Boolean)
  if (parts.length === 0) return
  params[key] = parts.join(',')
}

function appendIfNonEmpty(
  params: Record<string, string | number | boolean>,
  key: string,
  value: string | undefined,
) {
  const t = trimOrEmpty(value)
  if (!t) return
  params[key] = t
}

/** Maps multi-select formats to a single query param (comma-separated). */
function resolveSupervisionFormat(f: SupervisorSearchFilters): string | undefined {
  const formats = f.supervisionFormats.map((x) => x.trim()).filter(Boolean)
  if (formats.length === 0) return undefined
  if (formats.length === 1) return formats[0]
  return formats.join(',')
}

/**
 * Maps UI state to GET /api/supervision/search query params.
 * Omits empty values; comma-joins multi-value fields per API contract.
 * `city` and `state` are sent as single trimmed strings (matches supervisor search filter fields).
 * Always sends acceptingSupervisees (true/false) so the backend receives an explicit filter.
 */
/** Maps UI SortOption values to the API's sortBy param values. */
const SORT_OPTION_TO_API: Partial<Record<SortOption, string>> = {
  best_match: 'bestMatch',
  most_reviewed: 'mostReviewed',
  experience_desc: 'mostExperienced',
}

export function buildSupervisorSearchParams(
  input: SupervisorSearchQueryInput,
): Record<string, string | number | boolean> {
  const { page, limit, keywords, filters, sortBy } = input
  const params: Record<string, string | number | boolean> = {
    page,
    limit,
  }

  if (sortBy && SORT_OPTION_TO_API[sortBy]) {
    params.sortBy = SORT_OPTION_TO_API[sortBy]!
  }

  appendIfNonEmpty(params, 'keywords', keywords)

  const supervisionFormat = resolveSupervisionFormat(filters)
  appendIfNonEmpty(params, 'supervisionFormat', supervisionFormat)

  // Hierarchy-based filters (plain strings on SupervisorProfile)
  appendCommaSeparated(params, 'supervisorType', filters.supervisorTypes)
  appendCommaSeparated(params, 'supervisorOccupation', filters.supervisorOccupations)
  appendCommaSeparated(params, 'supervisorSpecialty', filters.supervisorSpecialties)

  appendCommaSeparated(params, 'licenseType', filters.licenseTypes)
  appendCommaSeparated(params, 'stateOfLicensure', filters.stateLicenses)
  appendCommaSeparated(params, 'yearsOfExperience', filters.yearsExperience)
  appendCommaSeparated(params, 'patientPopulation', filters.patientPopulation)
  appendCommaSeparated(params, 'availability', filters.availability)

  params.acceptingSupervisees = filters.acceptingOnly

  appendIfNonEmpty(params, 'city', filters.city)
  appendIfNonEmpty(params, 'state', filters.state)

  const radius = filters.radiusMiles
  const cityTrim = filters.city.trim()
  const stateTrim = filters.state.trim()
  // Radius search geocodes a single origin; backend requires both city and state.
  if (radius > 0 && cityTrim && stateTrim) {
    params.radius = radius
  }

  return params
}

const FORMAT_SET = new Set<string>(['VIRTUAL', 'IN_PERSON', 'HYBRID'])

function parseSupervisionFormats(raw: string | undefined): SupervisionFormat[] {
  if (!raw?.trim()) return []
  const parts = raw.split(/[,|]/).map((p) => p.trim())
  const out: SupervisionFormat[] = []
  for (const p of parts) {
    if (FORMAT_SET.has(p)) out.push(p as SupervisionFormat)
  }
  return out.length > 0 ? out : []
}

function parseSpecialtyTags(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function mapApiRowToSupervisorSearchResult(
  row: SupervisorSearchApiRow,
  index: number,
): SupervisorSearchResult {
  const fullName = row.fullName ?? ''
  const formats = parseSupervisionFormats(row.supervisionFormat)

  return {
    id: String(row.id),
    fullName,
    credentials: '',
    licenseType: getSupervisorDisplayCredential({
      supervisorType: row.supervisorType,
      licenseType: row.licenseType,
      degreeType: row.degreeType,
    }),
    supervisorType: formatSupervisorTypeLabel(row.supervisorType?.trim() || row.profession?.trim()),
    yearsOfExperience: row.yearsOfExperience != null ? String(row.yearsOfExperience) : '',
    city: row.city ?? '',
    state: row.state ?? '',
    location: row.location?.trim() || [row.city, row.state].filter(Boolean).join(', '),
    licenseNumber: row.licenseNumber ?? '',
    licenseState: row.stateLicense ?? row.state ?? '',
    formats,
    accepting: Boolean(row.acceptingSupervisees),
    bio: (row.professionalSummary ?? row.describeYourself ?? '').trim(),
    specialties: parseSpecialtyTags(row.specialty),
    patientPopulation: Array.isArray(row.patientPopulation) ? row.patientPopulation : [],
    profilePhotoUrl: row.profilePhotoUrl,
    initials: initialsFromName(fullName),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length] ?? AVATAR_COLORS[0],
  }
}

export async function fetchSupervisorSearch(
  query: Record<string, string | number | boolean>,
): Promise<{ results: SupervisorSearchResult[]; meta: SupervisorSearchMetaData }> {
  const { data } = await apiClient.get<SupervisorSearchApiResponse>('/supervision/search', {
    params: query,
  })

  const results = (data.data ?? []).map((row, i) => mapApiRowToSupervisorSearchResult(row, i))
  return { results, meta: data.metaData }
}
