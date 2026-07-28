'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateSuperviseeProfile,
  type UpdateSuperviseeProfilePayload,
} from '@/lib/api/supervisee-profile'
import { useUser } from '@/lib/contexts/UserContext'

import { superviseeProfileKeys } from './useSuperviseeProfile'

export function useUpdateSuperviseeProfile(userId: string) {
  const queryClient = useQueryClient()
  const { refreshUser } = useUser()

  return useMutation({
    mutationFn: (payload: UpdateSuperviseeProfilePayload) => updateSuperviseeProfile(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: superviseeProfileKeys.detail(userId),
        }),
        // UserContext feeds the topbar avatar/name; it doesn't observe the
        // react-query cache, so it needs its own refresh.
        refreshUser(),
      ])
    },
  })
}
