import type { User } from '@/types'
import type { HireListItem } from '@/types/hire'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import type { GoalStep } from './SuperviseeDashboardTypes'

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

/** True when profile field is a non-empty string or a non-empty string array (API may return either). */
function hasProfileStringList(value: string | string[] | null | undefined): boolean {
  if (value == null) return false
  if (Array.isArray(value)) return value.some((x) => String(x).trim().length > 0)
  return String(value).trim().length > 0
}

/** Individual checks used for dashboard completion % and onboarding goal "profile complete". */
function getSuperviseeProfileCompletionChecks(profile: SuperviseeProfileData): boolean[] {
  const { user } = profile
  return [
    !!user.emailVerified,
    !!user.profilePhotoUrl,
    !!(user.fullName ?? user.firstName ?? user.lastName),
    !!user.city,
    !!user.state,
    !!user.contactNumber,
    (user.stateOfLicensure?.length ?? 0) > 0,
    hasProfileStringList(profile.typeOfSupervisorNeeded),
    !!profile.preferredFormat,
    !!profile.availability,
    !!profile.howSoonLooking,
    hasProfileStringList(profile.stateTheyAreLookingIn),
    !!profile.budgetRangeType,
    !!profile.idealSupervisor,
  ]
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
      ctaHref: '/profile',
    },
    {
      label: 'Complete your profile',
      description: 'Add your supervision goals and license info',
      status: profileStepDone ? 'done' : emailVerified ? 'current' : 'upcoming',
      ctaHref: '/profile',
    },
    {
      label: 'Find your first supervisor',
      description: 'Browse verified supervisors and send a request',
      status: hasMetFirstSupervisorGoal ? 'done' : readyToFindSupervisor ? 'current' : 'upcoming',
      ctaHref: '/find-supervisors',
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
