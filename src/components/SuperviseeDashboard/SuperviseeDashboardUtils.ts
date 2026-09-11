import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'
import type { User } from '@/types'
import type { HireListItem } from '@/types/hire'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import type { GoalStep } from './SuperviseeDashboardTypes'

/** Where a supervisee edits their own profile (there is no `/profile` route). */
const MY_PROFILE_HREF = '/my-profile'

/**
 * Browse page for the "Find your first supervisor" goal. Supervisees whose only stored
 * need is Medical Director browse `/find-medical-directors` (matches the sidebar split);
 * everyone else, including legacy profiles without stored needs, browses `/find-supervisors`.
 */
export function getFindFirstSupervisorHref(profile?: SuperviseeProfileData | null): string {
  return isMedicalDirectorOnlyProfile(profile) ? '/find-medical-directors' : '/find-supervisors'
}

/** True when the only stored need is Medical Director (legacy profiles without needs are not). */
function isMedicalDirectorOnlyProfile(profile?: SuperviseeProfileData | null): boolean {
  const needs = profile ? getSuperviseeNeeds(profile) : []
  return needs.length > 0 && needs.every((need) => need === MEDICAL_DIRECTOR_TYPE_NAME)
}

/** Label + description for the last goal, worded for what the supervisee is actually looking for. */
function getFindFirstSupervisorCopy(profile?: SuperviseeProfileData | null): {
  label: string
  description: string
} {
  if (isMedicalDirectorOnlyProfile(profile)) {
    return {
      label: 'Find your first medical director',
      description: 'Browse verified medical directors and send a request',
    }
  }
  return {
    label: 'Find your first supervisor',
    description: 'Browse verified supervisors and send a request',
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

/** Lightweight completion based on the auth `User` object (used when full profile isn't loaded yet). */
export function getSuperviseeProfileCompletion(user: User): number {
  const checks: boolean[] = [
    !!user.emailVerified,
    !!user.profilePhotoUrl,
    !!user.fullName || !!user.name,
    !!user.city,
    !!user.state,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

/** Stored supervision needs as trimmed names (API may return a string or an array). */
function getSuperviseeNeeds(profile: SuperviseeProfileData): string[] {
  const raw = profile.typeOfSupervisorNeeded
  return (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map((need) => String(need).trim())
    .filter(Boolean)
}

/**
 * Individual checks used for dashboard completion % and onboarding goal "profile complete".
 * The how-soon / budget checks follow the stored needs: a supervision need is answered by
 * `howSoonLooking` + `budgetRangeType`, a Medical Director need by the md* columns. An
 * MD-only signup never sets the supervision-side fields, so they must not count against it.
 */
function getSuperviseeProfileCompletionChecks(profile: SuperviseeProfileData): boolean[] {
  const { user } = profile
  const needs = getSuperviseeNeeds(profile)
  const hasMdNeed = needs.includes(MEDICAL_DIRECTOR_TYPE_NAME)
  // Legacy profiles without stored needs are treated as supervision-only.
  const hasNonMdNeed =
    needs.length === 0 || needs.some((need) => need !== MEDICAL_DIRECTOR_TYPE_NAME)

  const checks = [
    !!user.emailVerified,
    !!user.profilePhotoUrl,
    !!(user.fullName ?? user.firstName ?? user.lastName),
    !!user.city,
    !!user.state,
    !!user.contactNumber,
    (user.stateOfLicensure?.length ?? 0) > 0,
    !!profile.title?.trim(),
    needs.length > 0,
    !!profile.preferredFormat,
    !!profile.availability,
    !!profile.idealSupervisor,
  ]
  if (hasNonMdNeed) {
    checks.push(!!profile.howSoonLooking, !!profile.budgetRangeType)
  }
  if (hasMdNeed) {
    checks.push(
      !!profile.mdPreferredOccupation,
      !!profile.mdHowSoonLooking,
      (profile.mdMonthlyBudget ?? 0) > 0,
    )
  }
  return checks
}

/**
 * Richer completion calculation using the full `SuperviseeProfileData`.
 * Covers account, location, supervision needs, and budget fields.
 */
export function getSuperviseeProfileCompletionFromData(profile: SuperviseeProfileData): number {
  const checks = getSuperviseeProfileCompletionChecks(profile)
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

/** True when every field counted toward profile completion is present (matches 100% completion). */
export function isSuperviseeOnboardingProfileComplete(profile: SuperviseeProfileData): boolean {
  return getSuperviseeProfileCompletionChecks(profile).every(Boolean)
}

/** Hire statuses that satisfy "Find your first supervisor" (sent a request or established/completed supervision). */
const FIND_FIRST_SUPERVISOR_STATUSES: ReadonlyArray<HireListItem['status']> = [
  'PENDING',
  'ACCEPTED',
  'ACTIVE',
  'COMPLETED',
  'REVIEWED',
  'REJECTED',
]

/** True when the supervisee has any hire past initial browse (request sent, active work, completed, or reviewed). */
export function hasMetFindFirstSupervisorGoal(hires: HireListItem[]): boolean {
  return hires.some((h) => FIND_FIRST_SUPERVISOR_STATUSES.includes(h.status))
}

/**
 * Derives onboarding goal steps. When `profile` is loaded from GET supervisee/profile, those
 * fields override the auth `user` (JWT/context can omit or stale `emailVerified`, city/state, etc.).
 */
export function getGoalSteps(
  user: User,
  hasMetFirstSupervisorGoal: boolean,
  profile?: SuperviseeProfileData | null,
): GoalStep[] {
  const emailVerified = profile?.user.emailVerified ?? user.emailVerified ?? false

  const profileStepDone = profile
    ? isSuperviseeOnboardingProfileComplete(profile)
    : Boolean(user.city && user.state)

  const readyToFindSupervisor = emailVerified && profileStepDone

  return [
    {
      label: 'Create your account',
      description: 'Account registered successfully',
      status: 'done',
    },
    {
      label: 'Verify your email',
      description: 'Confirm your email address',
      status: emailVerified ? 'done' : 'current',
      ctaHref: MY_PROFILE_HREF,
    },
    {
      label: 'Complete your profile',
      description: 'Add your supervision goals and license info',
      status: profileStepDone ? 'done' : emailVerified ? 'current' : 'upcoming',
      ctaHref: MY_PROFILE_HREF,
    },
    {
      ...getFindFirstSupervisorCopy(profile),
      status: hasMetFirstSupervisorGoal ? 'done' : readyToFindSupervisor ? 'current' : 'upcoming',
      ctaHref: getFindFirstSupervisorHref(profile),
    },
  ]
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Calendar-style label for a scheduled supervision slot (locale-aware). */
export function formatUpcomingSessionDisplay(iso: string | null): string {
  if (!iso) return 'Date to be confirmed'
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d)
  } catch {
    return 'Date to be confirmed'
  }
}
