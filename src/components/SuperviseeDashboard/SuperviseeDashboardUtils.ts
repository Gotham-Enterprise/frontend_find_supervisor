import type { User } from '@/types'
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
    !!profile.typeOfSupervisorNeeded,
    !!profile.preferredFormat,
    !!profile.availability,
    !!profile.howSoonLooking,
    !!profile.stateTheyAreLookingIn,
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

/**
 * Derives onboarding goal steps. When `profile` is loaded from GET supervisee/profile, those
 * fields override the auth `user` (JWT/context can omit or stale `emailVerified`, city/state, etc.).
 */
export function getGoalSteps(
  user: User,
  hasAcceptedRequest: boolean,
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
    },
    {
      label: 'Complete your profile',
      description: 'Add your supervision goals and license info',
      status: profileStepDone ? 'done' : emailVerified ? 'current' : 'upcoming',
    },
    {
      label: 'Find your first supervisor',
      description: 'Browse verified supervisors and send a request',
      status: hasAcceptedRequest ? 'done' : readyToFindSupervisor ? 'current' : 'upcoming',
    },
    {
      label: 'Complete 10 supervision hours',
      description: 'Work toward your licensed hours goal',
      status: 'upcoming',
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
