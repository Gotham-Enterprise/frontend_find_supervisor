import type { SelectOption } from '@/lib/api/options'

import type { SuperviseeSearchFilters } from './types'

export {
  FORMAT_BADGE_CLASSES,
  FORMAT_LABELS,
  SUPERVISION_FORMAT_TAG_OPTIONS,
} from '../SearchSupervisor/helpers'

export const DEFAULT_FILTERS: SuperviseeSearchFilters = {
  states: [],
  occupations: [],
  specialties: [],
}

export const SUPERVISEE_SEARCH_PAGE_SIZE = 10

export const SORT_OPTIONS = [
  { label: 'Best Match', value: 'best_match' },
  { label: 'Newest', value: 'newest' },
] as const

export const AVATAR_COLORS = [
  'bg-[#006d36]',
  'bg-[#2563eb]',
  'bg-[#7c3aed]',
  'bg-[#dc2626]',
  'bg-[#d97706]',
  'bg-[#0891b2]',
]

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export interface ActiveChip {
  key: string
  label: string
}

export function getActiveChips(
  filters: SuperviseeSearchFilters,
  stateOptions: SelectOption[] = [],
  occupationOptions: SelectOption[] = [],
  specialtyOptions: SelectOption[] = [],
): ActiveChip[] {
  const chips: ActiveChip[] = []

  filters.states.forEach((val) => {
    const label = stateOptions.find((o) => o.value === val)?.label ?? val
    chips.push({ key: `st_${val}`, label: `State: ${label}` })
  })

  filters.occupations.forEach((val) => {
    const label = occupationOptions.find((o) => o.value === val)?.label ?? val
    chips.push({ key: `occ_${encodeURIComponent(val)}`, label: `Occupation: ${label}` })
  })

  filters.specialties.forEach((val) => {
    const label = specialtyOptions.find((o) => o.value === val)?.label ?? val
    chips.push({ key: `spec_${encodeURIComponent(val)}`, label: `Specialty: ${label}` })
  })

  return chips
}

export function removeChip(
  filters: SuperviseeSearchFilters,
  chipKey: string,
): SuperviseeSearchFilters {
  const next: SuperviseeSearchFilters = {
    states: [...filters.states],
    occupations: [...filters.occupations],
    specialties: [...filters.specialties],
  }

  if (chipKey.startsWith('st_')) {
    const val = chipKey.slice(3)
    next.states = next.states.filter((s) => s !== val)
  } else if (chipKey.startsWith('occ_')) {
    const val = decodeURIComponent(chipKey.slice(4))
    next.occupations = next.occupations.filter((x) => x !== val)
    if (next.occupations.length === 0) next.specialties = []
  } else if (chipKey.startsWith('spec_')) {
    const val = decodeURIComponent(chipKey.slice(5))
    next.specialties = next.specialties.filter((x) => x !== val)
  }

  return next
}

export function hasActiveFilters(filters: SuperviseeSearchFilters): boolean {
  return getActiveChips(filters).length > 0
}
