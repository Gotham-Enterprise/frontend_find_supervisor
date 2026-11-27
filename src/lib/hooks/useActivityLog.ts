'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createActivityEntry,
  deleteActivityEntry,
  getHireActivityLog,
  updateActivityEntry,
} from '@/lib/api/activity-log'
import type { ActivityEntryInput, HireActivityLog } from '@/types/activity-log'

export const activityLogKeys = {
  all: ['supervision', 'activity-log'] as const,
  /** GET /supervision/hires/:hireId/activity-log */
  hire: (hireId: string) => [...activityLogKeys.all, 'hire', hireId] as const,
}

export function useHireActivityLog(hireId: string, enabled = true) {
  return useQuery({
    queryKey: activityLogKeys.hire(hireId),
    queryFn: () => getHireActivityLog(hireId),
    enabled,
    staleTime: 30 * 1000,
  })
}

/** Writes return the whole log, which replaces the cached one. */
function useActivityLogMutation<TVariables>(
  hireId: string,
  mutationFn: (variables: TVariables) => Promise<HireActivityLog>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (data) => queryClient.setQueryData(activityLogKeys.hire(hireId), data),
  })
}

export function useCreateActivityEntry(hireId: string) {
  return useActivityLogMutation(hireId, (input: ActivityEntryInput) =>
    createActivityEntry(hireId, input),
  )
}

export function useUpdateActivityEntry(hireId: string) {
  return useActivityLogMutation(
    hireId,
    ({ entryId, input }: { entryId: string; input: ActivityEntryInput }) =>
      updateActivityEntry(hireId, entryId, input),
  )
}

export function useDeleteActivityEntry(hireId: string) {
  return useActivityLogMutation(hireId, (entryId: string) => deleteActivityEntry(hireId, entryId))
}
