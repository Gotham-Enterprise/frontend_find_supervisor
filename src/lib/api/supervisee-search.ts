import { getAvatarColor } from '@/components/SearchSupervisee/helpers'
import type {
  SortOption,
  SuperviseeSearchFilters,
  SuperviseeSearchResult,
  SupervisionFormat,
} from '@/components/SearchSupervisee/types'

import { apiClient } from './client'

const FORMAT_SET = new Set<string>(['VIRTUAL', 'IN_PERSON', 'HYBRID'])

export interface SuperviseeSearchApiRow {
  id: string | number
  fullName?: string
  city?: string
  state?: string
  location?: string
  profilePhotoUrl?: string
  occupation?: string
  specialty?: string
  title?: string
  preferredFormat?: string
  howSoonLooking?: string
  stateTheyAreLookingIn?: string[]
  idealSupervisor?: string
  budgetRangeType?: string
  budgetRangeStart?: number | null
  budgetRangeEnd?: number | null
  hireStatusWithCurrentSupervisor?: string
}

export interface SuperviseeSearchMetaData {
  page: number
  limit: number
  totalPages: number
  totalCount: number
  currentPageTotalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface SuperviseeSearchApiResponse {
  success: boolean
  data: SuperviseeSearchApiRow[]
  metaData: SuperviseeSearchMetaData
}

export interface SuperviseeSearchQueryInput {
  page: number
  limit: number
  keywords: string
  filters: SuperviseeSearchFilters
  sortBy?: SortOption
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
  const t = value?.trim() ?? ''
  if (!t) return
  params[key] = t
}

const SORT_OPTION_TO_API: Partial<Record<SortOption, string>> = {
  best_match: 'bestMatch',
  newest: 'newest',
}

export function buildSuperviseeSearchParams(
  input: SuperviseeSearchQueryInput,
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
  appendCommaSeparated(params, 'state', filters.states)
  appendCommaSeparated(params, 'occupation', filters.occupations)
  appendCommaSeparated(params, 'specialty', filters.specialties)

  return params
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function parsePreferredFormat(raw: string | undefined): SupervisionFormat | '' {
  const v = raw?.trim().toUpperCase()
  if (v && FORMAT_SET.has(v)) return v as SupervisionFormat
  return ''
}

export function mapApiRowToSuperviseeSearchResult(
  row: SuperviseeSearchApiRow,
  index: number,
): SuperviseeSearchResult {
  const fullName = row.fullName ?? ''

  return {
    id: String(row.id),
    fullName,
    title: row.title ?? '',
    occupation: row.occupation ?? '',
    specialty: row.specialty ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    location: row.location?.trim() || [row.city, row.state].filter(Boolean).join(', '),
    preferredFormat: parsePreferredFormat(row.preferredFormat),
    howSoonLooking: row.howSoonLooking ?? '',
    stateTheyAreLookingIn: Array.isArray(row.stateTheyAreLookingIn)
      ? row.stateTheyAreLookingIn
      : [],
    bio: (row.idealSupervisor ?? '').trim(),
    budgetRangeType: row.budgetRangeType ?? '',
    budgetRangeStart: row.budgetRangeStart ?? null,
    budgetRangeEnd: row.budgetRangeEnd ?? null,
    profilePhotoUrl: row.profilePhotoUrl,
    initials: initialsFromName(fullName),
    avatarColor: getAvatarColor(index),
    hireStatusWithCurrentSupervisor: row.hireStatusWithCurrentSupervisor ?? 'NOT_HIRED',
  }
}

export async function fetchSuperviseeSearch(
  query: Record<string, string | number | boolean>,
): Promise<{ results: SuperviseeSearchResult[]; meta: SuperviseeSearchMetaData }> {
  const { data } = await apiClient.get<SuperviseeSearchApiResponse>(
    '/supervision/search/supervisees',
    { params: query },
  )

  const results = (data.data ?? []).map((row, i) => mapApiRowToSuperviseeSearchResult(row, i))
  return { results, meta: data.metaData }
}
