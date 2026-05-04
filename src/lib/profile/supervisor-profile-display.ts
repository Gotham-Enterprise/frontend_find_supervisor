import type { User } from '@/types'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

/**
 * Aligns `profile.user.fullName` with dashboard / modal expectations: prefer API fullName,
 * then session user fullName, then composed first+last, then session email.
 */
export function mergeSupervisorProfileDisplayName(
  profile: SupervisorProfileData,
  sessionUser: User | null | undefined,
): SupervisorProfileData {
  const composedName = `${profile.user.firstName ?? ''} ${profile.user.lastName ?? ''}`.trim()
  const displayName =
    profile.user.fullName ?? sessionUser?.fullName ?? (composedName || sessionUser?.email) ?? null

  return {
    ...profile,
    user: { ...profile.user, fullName: displayName ?? profile.user.fullName },
  }
}
