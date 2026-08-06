import { DEFAULT_FILTERS, RADIUS_DEFAULT, RADIUS_MAX, RADIUS_MIN } from './helpers'
import type { SortOption, SupervisorSearchFilters } from './types'

/**
 * Applied search state serialized into /find-supervisors query params so filters
 * survive navigating to a supervisor profile and back (and refresh/sharing).
 * Only non-default values are written, keeping the URL clean. Multi-value filters
 * use repeated keys (occ=a&occ=b) — option names may contain any characters.
 */

const SORT_OPTIONS_SET = new Set<SortOption>([
  'best_match',
  'most_reviewed',
  'experience_desc',
  'experience_asc',
])

/** Minimal read interface so plain URLSearchParams works in tests. */
interface ParamsReader {
  get(name: string): string | null
  getAll(name: string): string[]
  toString(): string
}

export interface SupervisorSearchUrlState {
  keyword: string
  filters: SupervisorSearchFilters
  sortBy: SortOption
  page: number
  /** True when the URL carried any search state — used to skip the profile prefill. */
  hasState: boolean
}

export function buildSearchUrlParams(input: {
  keyword: string
  filters: SupervisorSearchFilters
  sortBy: SortOption
  page: number
}): URLSearchParams {
  const { keyword, filters, sortBy, page } = input
  const params = new URLSearchParams()

  if (keyword.trim()) params.set('q', keyword.trim())

  filters.supervisorOccupations.forEach((v) => params.append('occ', v))
  filters.supervisorSpecialties.forEach((v) => params.append('spec', v))
  filters.licenseTypes.forEach((v) => params.append('lic', v))
  filters.stateLicenses.forEach((v) => params.append('sl', v))
  filters.supervisionFormats.forEach((v) => params.append('fmt', v))
  filters.yearsExperience.forEach((v) => params.append('yrs', v))
  filters.patientPopulation.forEach((v) => params.append('pop', v))
  filters.availability.forEach((v) => params.append('av', v))

  if (filters.state.trim()) params.set('st', filters.state.trim())
  if (filters.city.trim()) params.set('city', filters.city.trim())
  if (filters.radiusMiles !== RADIUS_DEFAULT) params.set('r', String(filters.radiusMiles))
  if (!filters.acceptingOnly) params.set('acc', '0')

  if (sortBy !== 'best_match') params.set('sort', sortBy)
  if (page > 1) params.set('page', String(page))

  return params
}

export function parseSearchUrlState(params: ParamsReader): SupervisorSearchUrlState {
  const radiusRaw = Number(params.get('r'))
  const radiusMiles =
    Number.isFinite(radiusRaw) && radiusRaw >= RADIUS_MIN && radiusRaw <= RADIUS_MAX
      ? radiusRaw
      : RADIUS_DEFAULT

  const filters: SupervisorSearchFilters = {
    ...DEFAULT_FILTERS,
    supervisorOccupations: params.getAll('occ'),
    supervisorSpecialties: params.getAll('spec'),
    licenseTypes: params.getAll('lic'),
    stateLicenses: params.getAll('sl'),
    supervisionFormats: params.getAll('fmt'),
    yearsExperience: params.getAll('yrs'),
    patientPopulation: params.getAll('pop'),
    availability: params.getAll('av'),
    state: params.get('st')?.trim() ?? '',
    city: params.get('city')?.trim() ?? '',
    radiusMiles,
    acceptingOnly: params.get('acc') !== '0',
  }

  const sortRaw = params.get('sort') as SortOption | null
  const sortBy: SortOption = sortRaw && SORT_OPTIONS_SET.has(sortRaw) ? sortRaw : 'best_match'

  const pageRaw = Number(params.get('page'))
  const page = Number.isInteger(pageRaw) && pageRaw > 1 ? pageRaw : 1

  const keyword = params.get('q')?.trim() ?? ''

  const STATE_KEYS = [
    'q',
    'occ',
    'spec',
    'lic',
    'sl',
    'fmt',
    'yrs',
    'pop',
    'av',
    'st',
    'city',
    'r',
    'acc',
    'sort',
    'page',
  ]
  const hasState = STATE_KEYS.some((key) => params.get(key) !== null)

  return { keyword, filters, sortBy, page, hasState }
}
