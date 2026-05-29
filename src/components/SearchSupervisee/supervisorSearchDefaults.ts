import type { SelectOption } from '@/lib/api/options'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

import type { SuperviseeSearchFilters } from './types'

function cloneFilters(base: SuperviseeSearchFilters): SuperviseeSearchFilters {
  return {
    states: [...base.states],
    occupations: [...base.occupations],
    specialties: [...base.specialties],
  }
}

/**
 * Pre-fills supervisee search filters from the logged-in supervisor's profile:
 * licensed states, occupation, and specialty.
 */
export function mergeSupervisorProfileIntoSearchFilters(
  profile: SupervisorProfileData | null | undefined,
  base: SuperviseeSearchFilters,
  stateOptions: SelectOption[],
  occupationOptions: SelectOption[],
): SuperviseeSearchFilters {
  const next = cloneFilters(base)
  if (!profile) return next

  const stateVals = new Set(stateOptions.map((o) => o.value))
  const occupationVals = new Set(occupationOptions.map((o) => o.label))

  const licensedStates = (profile.user.stateOfLicensure ?? [])
    .map((s) => String(s).trim())
    .filter((s) => s && stateVals.has(s))
  if (licensedStates.length > 0) {
    next.states = licensedStates
  }

  const occupationName = profile.user.occupation?.name?.trim()
  if (occupationName && occupationVals.has(occupationName)) {
    next.occupations = [occupationName]
  }

  const specialtyName = profile.user.specialty?.name?.trim()
  if (specialtyName) {
    next.specialties = [specialtyName]
  }

  return next
}
