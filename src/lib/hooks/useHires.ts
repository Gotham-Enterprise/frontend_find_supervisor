'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  acceptHire,
  cancelHire,
  getSuperviseeUpcomingSessions,
  hireSupervisor,
  listHires,
  markHireAsCompleted,
  rejectHire,
  viewHire,
} from '@/lib/api/supervision'
import type { HireStatus, HireSupervisorRequestInput } from '@/types/hire'

import { supervisorDetailKeys } from './useSupervisor'

export const hireKeys = {
  all: ['hires'] as const,
  list: (page: number, limit: number, status?: HireStatus | HireStatus[]) =>
    [
      ...hireKeys.all,
      'list',
      page,
      limit,
      Array.isArray(status) ? status.join(',') : (status ?? ''),
    ] as const,
  pendingCount: () => [...hireKeys.all, 'pending-count'] as const,
}

export const upcomingSessionsKeys = {
  all: ['supervision', 'supervisee-upcoming-sessions'] as const,
}

async function invalidateHireRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: hireKeys.all })
  await queryClient.invalidateQueries({ queryKey: upcomingSessionsKeys.all })
}

export function useHireSupervisor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: HireSupervisorRequestInput) => hireSupervisor(payload),
    // onSettled (not onSuccess) so a failed mutation (e.g. a 409 conflict from
    // a concurrent status change) also refetches the now-stale hire data.
    onSettled: async (_data, _error, variables) => {
      await invalidateHireRelatedQueries(queryClient)
      await queryClient.invalidateQueries({
        queryKey: supervisorDetailKeys.detail(variables.supervisorId),
      })
    },
  })
}

export function useHiresList(page = 1, limit = 10, status?: HireStatus | HireStatus[]) {
  return useQuery({
    queryKey: hireKeys.list(page, limit, status),
    queryFn: () => listHires(page, limit, status),
    staleTime: 2 * 60 * 1000,
  })
}

export function useSuperviseeUpcomingSessions() {
  return useQuery({
    queryKey: upcomingSessionsKeys.all,
    queryFn: () => getSuperviseeUpcomingSessions(),
    staleTime: 2 * 60 * 1000,
  })
}

/** Returns the total count of PENDING hire requests for the authenticated supervisor. */
export function usePendingRequestsCount(enabled = true) {
  return useQuery({
    queryKey: hireKeys.pendingCount(),
    queryFn: () => listHires(1, 1, 'PENDING'),
    enabled,
    select: (data) => data.totalCount,
  })
}

export function useViewHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hireId: string) => viewHire(hireId),
    onSettled: async () => {
      await invalidateHireRelatedQueries(queryClient)
    },
  })
}

export function useAcceptHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hireId: string) => acceptHire(hireId),
    onSettled: async () => {
      await invalidateHireRelatedQueries(queryClient)
    },
  })
}

export function useRejectHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hireId, reason }: { hireId: string; reason: string }) =>
      rejectHire(hireId, reason),
    onSettled: async () => {
      await invalidateHireRelatedQueries(queryClient)
    },
  })
}

export function useCancelHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hireId: string) => cancelHire(hireId),
    onSettled: async () => {
      await invalidateHireRelatedQueries(queryClient)
    },
  })
}

export function useMarkHireAsCompleted() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hireId: string) => markHireAsCompleted(hireId),
    onSettled: async () => {
      await invalidateHireRelatedQueries(queryClient)
    },
  })
}
