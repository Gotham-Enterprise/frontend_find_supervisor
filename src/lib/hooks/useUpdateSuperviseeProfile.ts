'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateSuperviseeProfile,
  type UpdateSuperviseeProfilePayload,
} from '@/lib/api/supervisee-profile'

import { superviseeProfileKeys } from './useSuperviseeProfile'

export function useUpdateSuperviseeProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSuperviseeProfilePayload) => updateSuperviseeProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: superviseeProfileKeys.detail(userId),
      })
    },
  })
}
