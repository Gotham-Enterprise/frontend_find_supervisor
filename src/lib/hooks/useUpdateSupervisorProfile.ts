'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateSupervisorProfile,
  type UpdateSupervisorProfilePayload,
} from '@/lib/api/supervisor-profile'

import { supervisorProfileKeys } from './useSupervisorProfile'

export function useUpdateSupervisorProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSupervisorProfilePayload) => updateSupervisorProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: supervisorProfileKeys.detail(userId),
      })
    },
  })
}
