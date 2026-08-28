import type { SelectOption, SupervisorTypeData } from '@/lib/api/options'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import type { SupervisorSearchFilters } from './types'

const FORMAT_SET = new Set<string>(['VIRTUAL', 'IN_PERSON', 'HYBRID'])

function buildHierarchyNameSets(supervisorTypesData: SupervisorTypeData[]) {
  const occupations = new Set<string>()
  const specialties = new Set<string>()

  for (const type of supervisorTypesData) {
    for (const occupation of type.occupations) {
      occupations.add(occupation.name)
      for (const specialty of occupation.specialties) specialties.add(specialty.name)
    }
  }

  return { occupations, specialties }
}

/**
 * Builds the default search filters for /find-supervisors from the supervisee's
 * Supervision Needs (desired occupation/specialty, their states of licensure,
 * preferred format, availability). Values that don't match the loaded options are
 * skipped. Supervisor type is NOT a filter — the backend scopes results to the
 * supervisee's stored typeOfSupervisorNeeded on every search.
 */
export function mergeSuperviseeProfileIntoSearchFilters(
  profile: SuperviseeProfileData | null | undefined,
  base: SupervisorSearchFilters,
  stateOptions: SelectOption[],
  availabilityOptions: SelectOption[],
  supervisorTypesData: SupervisorTypeData[] = [],
): SupervisorSearchFilters {
  const next: SupervisorSearchFilters = {
    ...base,
    supervisorOccupations: [...base.supervisorOccupations],
    supervisorSpecialties: [...base.supervisorSpecialties],
    licenseTypes: [...base.licenseTypes],
    stateLicenses: [...base.stateLicenses],
    supervisionFormats: [...base.supervisionFormats],
    yearsExperience: [...base.yearsExperience],
    patientPopulation: [...base.patientPopulation],
    availability: [...base.availability],
  }
  if (!profile) return next

  const hierarchy = buildHierarchyNameSets(supervisorTypesData)

  const occupation = profile.superviseeOccupation?.trim()
  if (occupation && hierarchy.occupations.has(occupation)) {
    next.supervisorOccupations = [occupation]
  }

  const specialty = profile.superviseeSpecialty?.trim()
  if (specialty && hierarchy.specialties.has(specialty)) {
    next.supervisorSpecialties = [specialty]
  }

  // Supervisors licensed in the state(s) the supervisee is licensed in
  const stateVals = new Set(stateOptions.map((o) => o.value))
  const superviseeStates = (profile.user?.stateOfLicensure ?? [])
    .map((s) => String(s).trim())
    .filter((s) => s && stateVals.has(s))
  if (superviseeStates.length > 0) {
    next.stateLicenses = [...new Set(superviseeStates)]
  }

  const preferredFormat = profile.preferredFormat?.trim().toUpperCase()
  if (preferredFormat && FORMAT_SET.has(preferredFormat)) {
    next.supervisionFormats = [preferredFormat]
  }

  const availability = profile.availability?.trim()
  if (availability && availabilityOptions.some((o) => o.value === availability)) {
    next.availability = [availability]
  }

  return next
}

/**
 * True when the merged filters actually carry profile-seeded values — used to
 * arm the zero-result auto-relax only when the prefill applied something.
 */
export function hasSeededFilterValues(filters: SupervisorSearchFilters): boolean {
  return (
    filters.supervisorOccupations.length > 0 ||
    filters.supervisorSpecialties.length > 0 ||
    filters.stateLicenses.length > 0 ||
    filters.supervisionFormats.length > 0 ||
    filters.availability.length > 0
  )
}
