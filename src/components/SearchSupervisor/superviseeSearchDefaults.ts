import type { SelectOption } from '@/lib/api/options'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import type { SupervisorSearchFilters } from './types'

function cloneFilters(base: SupervisorSearchFilters): SupervisorSearchFilters {
  return {
    ...base,
    occupationIds: [...base.occupationIds],
    specialtyIds: [...base.specialtyIds],
    licenseTypes: [...base.licenseTypes],
    stateLicenses: [...base.stateLicenses],
    city: base.city,
    state: base.state,
    supervisionFormats: [...base.supervisionFormats],
    yearsExperience: [...base.yearsExperience],
    patientPopulation: [...base.patientPopulation],
    availability: [...base.availability],
  }
}

const FORMAT_SET = new Set<string>(['VIRTUAL', 'IN_PERSON', 'HYBRID'])

/**
 * Maps supervisee profile "Type of Supervisor Needed" (`supervisorType` API values like
 * `LPCC_SUPERVISOR`) to supervisor search `licenseType` filter values (`LPCC`, etc.).
 * Merges results when the profile lists multiple types.
 */
export function mapSupervisorNeededToLicenseTypes(
  typeNeeded: string | string[] | null | undefined,
  licenseTypeValues: ReadonlySet<string>,
): string[] {
  const rawList = Array.isArray(typeNeeded)
    ? typeNeeded.map((s) => String(s).trim()).filter(Boolean)
    : typeNeeded?.trim()
      ? [typeNeeded.trim()]
      : []
  const out = new Set<string>()
  for (const raw of rawList) {
    if (licenseTypeValues.has(raw)) {
      out.add(raw)
      continue
    }
    const stripped = raw.replace(/_SUPERVISOR$/i, '')
    if (stripped && licenseTypeValues.has(stripped)) {
      out.add(stripped)
    }
  }
  return [...out]
}

/**
 * Applies Supervision Needs from the supervisee profile onto search filters (license type,
 * state they are looking in, preferred format, availability). Unknown values are skipped.
 */
export function mergeSuperviseeProfileIntoSearchFilters(
  profile: SuperviseeProfileData | null | undefined,
  base: SupervisorSearchFilters,
  licenseTypeOptions: SelectOption[],
  stateOptions: SelectOption[],
  availabilityOptions: SelectOption[],
): SupervisorSearchFilters {
  const next = cloneFilters(base)
  if (!profile) return next

  const licenseVals = new Set(licenseTypeOptions.map((o) => o.value))
  const stateVals = new Set(stateOptions.map((o) => o.value))
  const availVals = new Set(availabilityOptions.map((o) => o.value))

  const licenseFromSupervisorType = mapSupervisorNeededToLicenseTypes(
    profile.typeOfSupervisorNeeded,
    licenseVals,
  )
  if (licenseFromSupervisorType.length > 0) {
    next.licenseTypes = licenseFromSupervisorType
  }

  const stateKeys = (profile.stateTheyAreLookingIn ?? [])
    .map((s) => String(s).trim())
    .filter(Boolean)
  const validStates = stateKeys.filter((s) => stateVals.has(s))
  if (validStates.length > 0) {
    next.state = validStates[0]!
    next.city = ''
  }

  const pf = profile.preferredFormat?.trim().toUpperCase()
  if (pf && FORMAT_SET.has(pf)) {
    next.supervisionFormats = [pf]
  }

  const av = profile.availability?.trim()
  if (av && availVals.has(av)) {
    next.availability = [av]
  }

  return next
}
