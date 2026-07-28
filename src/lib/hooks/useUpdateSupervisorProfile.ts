'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateSupervisorProfile,
  type UpdateSupervisorProfilePayload,
} from '@/lib/api/supervisor-profile'
import { useUser } from '@/lib/contexts/UserContext'

import { supervisorProfileKeys } from './useSupervisorProfile'

export function useUpdateSupervisorProfile(userId: string) {
  const queryClient = useQueryClient()
  const { refreshUser } = useUser()

  return useMutation({
    mutationFn: (payload: UpdateSupervisorProfilePayload) => updateSupervisorProfile(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: supervisorProfileKeys.detail(userId),
        }),
        // UserContext feeds the topbar avatar/name; it doesn't observe the
        // react-query cache, so it needs its own refresh.
        refreshUser(),
      ])
    },
  })
}
