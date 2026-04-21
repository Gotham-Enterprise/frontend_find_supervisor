'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateSupervisionSettings,
  type UpdateSupervisionSettingsPayload,
} from '@/lib/api/supervision-settings'

import { supervisionSettingsKeys } from './useSupervisionSettings'

export function useUpdateSupervisionSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSupervisionSettingsPayload) => updateSupervisionSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: supervisionSettingsKeys.current(),
      })
    },
  })
}
