'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveBillingWeek,
  deleteHireSession,
  disputeBillingWeek,
  getHireBillingWeeks,
  logHireSession,
  updateHireSession,
} from '@/lib/api/supervision'
import type { HireBillingWeeks, HireSessionInput } from '@/types/sessions'

export const hireSessionKeys = {
  all: ['supervision', 'hire-sessions'] as const,
  /** GET /supervision/hires/:hireId/billing-weeks */
  weeks: (hireId: string) => [...hireSessionKeys.all, hireId] as const,
}

export function useHireBillingWeeks(hireId: string, enabled: boolean) {
  return useQuery({
    queryKey: hireSessionKeys.weeks(hireId),
    queryFn: () => getHireBillingWeeks(hireId),
    enabled,
    staleTime: 0,
  })
}

/** Every session/review mutation returns the hire's refreshed billing weeks. */
function useBillingWeeksMutation<TVariables>(
  hireId: string,
  mutationFn: (variables: TVariables) => Promise<HireBillingWeeks>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (data) => queryClient.setQueryData(hireSessionKeys.weeks(hireId), data),
    // A rejected change (e.g. the week just closed) means the cached state is stale.
    onError: () => queryClient.invalidateQueries({ queryKey: hireSessionKeys.weeks(hireId) }),
  })
}

export function useLogHireSession(hireId: string) {
  return useBillingWeeksMutation(hireId, (input: HireSessionInput) => logHireSession(hireId, input))
}

export function useUpdateHireSession(hireId: string) {
  return useBillingWeeksMutation(
    hireId,
    ({ sessionId, input }: { sessionId: string; input: HireSessionInput }) =>
      updateHireSession(hireId, sessionId, input),
  )
}

export function useDeleteHireSession(hireId: string) {
  return useBillingWeeksMutation(hireId, (sessionId: string) =>
    deleteHireSession(hireId, sessionId),
  )
}

export function useApproveBillingWeek(hireId: string) {
  return useBillingWeeksMutation(hireId, (weekId: string) => approveBillingWeek(hireId, weekId))
}

export function useDisputeBillingWeek(hireId: string) {
  return useBillingWeeksMutation(hireId, ({ weekId, reason }: { weekId: string; reason: string }) =>
    disputeBillingWeek(hireId, weekId, reason),
  )
}
