'use client'

import { useQuery } from '@tanstack/react-query'

import { getSuperviseeProfile } from '@/lib/api/supervisee-profile'
import { useUser } from '@/lib/contexts/UserContext'

export const superviseeProfileKeys = {
  all: ['supervisee-profile'] as const,
  detail: (userId: string) => [...superviseeProfileKeys.all, userId] as const,
}

/**
 * Fetches the authenticated supervisee's own profile using `useUser().id`.
 * Query is disabled when the user id is not available.
 */
export function useSuperviseeProfile() {
  const { user } = useUser()
  const userId = user?.id

  return useQuery({
    queryKey: userId
      ? superviseeProfileKeys.detail(userId)
      : (['supervisee-profile-disabled'] as const),
    queryFn: () => getSuperviseeProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

/** Fetches any supervisee profile by id (supervisor browse / profile page). */
export function useSuperviseeProfileById(superviseeId: string) {
  return useQuery({
    queryKey: superviseeProfileKeys.detail(superviseeId),
    queryFn: () => getSuperviseeProfile(superviseeId),
    enabled: !!superviseeId,
    staleTime: 1000 * 60 * 5,
  })
}
