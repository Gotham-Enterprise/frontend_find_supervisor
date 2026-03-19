import type { SelectOption } from '@/lib/api/options'

import type { SupervisionFormat, SupervisorSearchFilters } from './types'

export const RADIUS_MIN = 5
export const RADIUS_MAX = 100
export const RADIUS_STEP = 5
export const RADIUS_DEFAULT = 25

export const DEFAULT_FILTERS: SupervisorSearchFilters = {
  keyword: '',
  occupationId: '',
  specialtyId: '',
  stateLicenses: [],
  cities: [],
  states: [],
  radiusMiles: RADIUS_DEFAULT,
  formatVirtual: false,
  formatInPerson: false,
  formatHybrid: false,
  yearsOfExperience: '',
  patientPopulation: [],
  acceptingOnly: false,
}

export const FORMAT_LABELS: Record<SupervisionFormat, string> = {
  VIRTUAL: 'Virtual',
  IN_PERSON: 'In-Person',
  HYBRID: 'Hybrid',
}

export const FORMAT_BADGE_CLASSES: Record<SupervisionFormat, string> = {
  VIRTUAL: 'bg-blue-50 text-blue-700 border border-blue-100',
  IN_PERSON: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  HYBRID: 'bg-violet-50 text-violet-700 border border-violet-100',
}

export const YEARS_OF_EXPERIENCE_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '0–1 years', value: '0_1' },
  { label: '2–3 years', value: '2_3' },
  { label: '4–5 years', value: '4_5' },
  { label: '6–10 years', value: '6_10' },
  { label: '11–15 years', value: '11_15' },
  { label: '16–20 years', value: '16_20' },
  { label: '20+ years', value: '20_PLUS' },
]

export const SORT_OPTIONS = [
  { label: 'Best Match', value: 'best_match' },
  { label: 'Most Reviewed', value: 'most_reviewed' },
  { label: 'Most Experience', value: 'experience_desc' },
]

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

export interface ChipOptions {
  occupationOptions?: SelectOption[]
  specialtyOptions?: SelectOption[]
}

export function getActiveChips(
  filters: SupervisorSearchFilters,
  chipOptions?: ChipOptions,
): ActiveChip[] {
  const chips: ActiveChip[] = []

  if (filters.occupationId && chipOptions?.occupationOptions) {
    const label = chipOptions.occupationOptions.find((o) => o.value === filters.occupationId)?.label
    if (label) chips.push({ key: 'occupationId', label })
  }

  if (filters.specialtyId && chipOptions?.specialtyOptions) {
    const label = chipOptions.specialtyOptions.find((o) => o.value === filters.specialtyId)?.label
    if (label) chips.push({ key: 'specialtyId', label })
  }

  if (filters.radiusMiles !== RADIUS_DEFAULT) {
    chips.push({ key: 'radiusMiles', label: `Within ${filters.radiusMiles} miles` })
  }

  filters.stateLicenses.forEach((sl) => chips.push({ key: `sl_${sl}`, label: `License: ${sl}` }))
  filters.states.forEach((st) => chips.push({ key: `st_${st}`, label: st }))
  filters.cities.forEach((c) => chips.push({ key: `city_${c}`, label: c }))

  if (filters.formatVirtual) chips.push({ key: 'formatVirtual', label: 'Virtual' })
  if (filters.formatInPerson) chips.push({ key: 'formatInPerson', label: 'In-Person' })
  if (filters.formatHybrid) chips.push({ key: 'formatHybrid', label: 'Hybrid' })

  if (filters.yearsOfExperience) {
    const opt = YEARS_OF_EXPERIENCE_OPTIONS.find((o) => o.value === filters.yearsOfExperience)
    chips.push({ key: 'yearsOfExperience', label: opt?.label ?? filters.yearsOfExperience })
  }

  filters.patientPopulation.forEach((pop) => {
    chips.push({ key: `pop_${pop}`, label: pop })
  })

  if (filters.acceptingOnly) chips.push({ key: 'acceptingOnly', label: 'Accepting Only' })

  return chips
}

export function removeChip(
  filters: SupervisorSearchFilters,
  chipKey: string,
): SupervisorSearchFilters {
  const next: SupervisorSearchFilters = {
    ...filters,
    stateLicenses: [...filters.stateLicenses],
    cities: [...filters.cities],
    states: [...filters.states],
    patientPopulation: [...filters.patientPopulation],
  }

  if (chipKey.startsWith('sl_')) {
    const val = chipKey.slice(3)
    next.stateLicenses = next.stateLicenses.filter((s) => s !== val)
  } else if (chipKey.startsWith('st_')) {
    const val = chipKey.slice(3)
    next.states = next.states.filter((s) => s !== val)
  } else if (chipKey.startsWith('city_')) {
    const val = chipKey.slice(5)
    next.cities = next.cities.filter((c) => c !== val)
  } else if (chipKey === 'formatVirtual') {
    next.formatVirtual = false
  } else if (chipKey === 'formatInPerson') {
    next.formatInPerson = false
  } else if (chipKey === 'formatHybrid') {
    next.formatHybrid = false
  } else if (chipKey === 'yearsOfExperience') {
    next.yearsOfExperience = ''
  } else if (chipKey === 'acceptingOnly') {
    next.acceptingOnly = false
  } else if (chipKey === 'radiusMiles') {
    next.radiusMiles = RADIUS_DEFAULT
  } else if (chipKey === 'occupationId') {
    next.occupationId = ''
    next.specialtyId = ''
  } else if (chipKey === 'specialtyId') {
    next.specialtyId = ''
  } else if (chipKey.startsWith('pop_')) {
    const pop = chipKey.slice(4)
    next.patientPopulation = next.patientPopulation.filter((p) => p !== pop)
  }

  return next
}

export function hasActiveFilters(filters: SupervisorSearchFilters): boolean {
  return getActiveChips(filters).length > 0
}
