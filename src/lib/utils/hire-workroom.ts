import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'

export type WorkroomTab = 'overview' | 'timesheet' | 'billing' | 'activity' | 'messages' | 'details'

/** The supervisee's hired list a hire lives on (Medical Director hires have their own page). */
export type HiredListPath = '/hired-supervisors' | '/hired-medical-directors'

export function hiredListPath(hire: {
  typeOfSupervisorNeeded: string | string[] | null
}): HiredListPath {
  const raw = hire.typeOfSupervisorNeeded
  const needed = Array.isArray(raw) ? raw : raw ? [raw] : []
  return needed.some((name) => name?.trim() === MEDICAL_DIRECTOR_TYPE_NAME)
    ? '/hired-medical-directors'
    : '/hired-supervisors'
}

/** A supervisee's workroom for one hire, under the hired list it lives on. */
export function workroomHref(
  hireId: string,
  tab?: WorkroomTab,
  listPath: HiredListPath = '/hired-supervisors',
): string {
  const base = `${listPath}/${hireId}`
  return tab && tab !== 'overview' ? `${base}?tab=${tab}` : base
}
