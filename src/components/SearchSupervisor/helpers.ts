import type { SelectOption } from '@/lib/api/options'

import type { SupervisionFormat, SupervisorSearchFilters } from './types'

export const RADIUS_MIN = 5
export const RADIUS_MAX = 100
export const RADIUS_STEP = 5
export const RADIUS_DEFAULT = 25

export const DEFAULT_FILTERS: SupervisorSearchFilters = {
  occupationIds: [],
  specialtyIds: [],
  licenseTypes: [],
  stateLicenses: [],
  cities: [],
  states: [],
  radiusMiles: RADIUS_DEFAULT,
  supervisionFormats: [],
  yearsExperience: [],
  patientPopulation: [],
  acceptingOnly: false,
  availability: [],
}

/** Page size for supervisor search results (must match API default limit). */
export const SUPERVISOR_SEARCH_PAGE_SIZE = 10

export const FORMAT_LABELS: Record<SupervisionFormat, string> = {
  VIRTUAL: 'Virtual',
  IN_PERSON: 'In-Person',
  HYBRID: 'Hybrid',
}

/** TagInput options for supervision format (Virtual / In-Person / Hybrid). */
export const SUPERVISION_FORMAT_TAG_OPTIONS: SelectOption[] = [
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Hybrid', value: 'HYBRID' },
]

export const FORMAT_BADGE_CLASSES: Record<SupervisionFormat, string> = {
  VIRTUAL: 'bg-blue-50 text-blue-700 border border-blue-100',
  IN_PERSON: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  HYBRID: 'bg-violet-50 text-violet-700 border border-violet-100',
}

/** Years range options for search TagInput. */
export const YEARS_OF_EXPERIENCE_OPTIONS = [
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
  licenseTypeOptions?: SelectOption[]
  availabilityOptions?: SelectOption[]
}

export function getActiveChips(
  filters: SupervisorSearchFilters,
  chipOptions?: ChipOptions,
): ActiveChip[] {
  const chips: ActiveChip[] = []

  filters.occupationIds.forEach((id) => {
    const label = chipOptions?.occupationOptions?.find((o) => o.value === id)?.label ?? id
    chips.push({ key: `occ_${id}`, label })
  })

  filters.specialtyIds.forEach((id) => {
    const label = chipOptions?.specialtyOptions?.find((o) => o.value === id)?.label ?? id
    chips.push({ key: `spec_${id}`, label })
  })

  filters.licenseTypes.forEach((val) => {
    const label = chipOptions?.licenseTypeOptions?.find((o) => o.value === val)?.label ?? val
    chips.push({ key: `lic_${encodeURIComponent(val)}`, label })
  })

  filters.availability.forEach((val) => {
    const label = chipOptions?.availabilityOptions?.find((o) => o.value === val)?.label ?? val
    chips.push({ key: `av_${encodeURIComponent(val)}`, label })
  })

  if (filters.radiusMiles !== RADIUS_DEFAULT) {
    chips.push({ key: 'radiusMiles', label: `Within ${filters.radiusMiles} miles` })
  }

  filters.stateLicenses.forEach((sl) => chips.push({ key: `sl_${sl}`, label: `License: ${sl}` }))
  filters.states.forEach((st) => chips.push({ key: `st_${st}`, label: st }))
  filters.cities.forEach((c) => chips.push({ key: `city_${c}`, label: c }))

  filters.supervisionFormats.forEach((fmt) => {
    const label = FORMAT_LABELS[fmt as SupervisionFormat] ?? fmt
    chips.push({ key: `sf_${fmt}`, label })
  })

  filters.yearsExperience.forEach((val) => {
    const opt = YEARS_OF_EXPERIENCE_OPTIONS.find((o) => o.value === val)
    chips.push({ key: `ye_${encodeURIComponent(val)}`, label: opt?.label ?? val })
  })

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
    occupationIds: [...filters.occupationIds],
    specialtyIds: [...filters.specialtyIds],
    licenseTypes: [...filters.licenseTypes],
    stateLicenses: [...filters.stateLicenses],
    cities: [...filters.cities],
    states: [...filters.states],
    supervisionFormats: [...filters.supervisionFormats],
    yearsExperience: [...filters.yearsExperience],
    patientPopulation: [...filters.patientPopulation],
    availability: [...filters.availability],
  }

  if (chipKey.startsWith('occ_')) {
    const id = chipKey.slice(4)
    next.occupationIds = next.occupationIds.filter((x) => x !== id)
    if (next.occupationIds.length === 0) next.specialtyIds = []
  } else if (chipKey.startsWith('spec_')) {
    const id = chipKey.slice(5)
    next.specialtyIds = next.specialtyIds.filter((x) => x !== id)
  } else if (chipKey.startsWith('lic_')) {
    const val = decodeURIComponent(chipKey.slice(4))
    next.licenseTypes = next.licenseTypes.filter((x) => x !== val)
  } else if (chipKey.startsWith('av_')) {
    const val = decodeURIComponent(chipKey.slice(3))
    next.availability = next.availability.filter((x) => x !== val)
  } else if (chipKey.startsWith('ye_')) {
    const val = decodeURIComponent(chipKey.slice(3))
    next.yearsExperience = next.yearsExperience.filter((x) => x !== val)
  } else if (chipKey.startsWith('sf_')) {
    const fmt = chipKey.slice(3)
    next.supervisionFormats = next.supervisionFormats.filter((x) => x !== fmt)
  } else if (chipKey.startsWith('sl_')) {
    const val = chipKey.slice(3)
    next.stateLicenses = next.stateLicenses.filter((s) => s !== val)
  } else if (chipKey.startsWith('st_')) {
    const val = chipKey.slice(3)
    next.states = next.states.filter((s) => s !== val)
  } else if (chipKey.startsWith('city_')) {
    const val = chipKey.slice(5)
    next.cities = next.cities.filter((c) => c !== val)
  } else if (chipKey === 'acceptingOnly') {
    next.acceptingOnly = false
  } else if (chipKey === 'radiusMiles') {
    next.radiusMiles = RADIUS_DEFAULT
  } else if (chipKey.startsWith('pop_')) {
    const pop = chipKey.slice(4)
    next.patientPopulation = next.patientPopulation.filter((p) => p !== pop)
  }

  return next
}

export function hasActiveFilters(filters: SupervisorSearchFilters): boolean {
  return getActiveChips(filters).length > 0
}
