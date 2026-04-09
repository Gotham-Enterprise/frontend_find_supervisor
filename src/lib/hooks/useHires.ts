'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  acceptHire,
  cancelHire,
  hireSupervisor,
  listHires,
  rejectHire,
} from '@/lib/api/supervision'
import type { HireSupervisorPayload } from '@/types/hire'

export const hireKeys = {
  all: ['hires'] as const,
  list: (page: number, limit: number) => [...hireKeys.all, 'list', page, limit] as const,
  pendingCount: () => [...hireKeys.all, 'pending-count'] as const,
}

export function useHireSupervisor() {
  return useMutation({
    mutationFn: (payload: HireSupervisorPayload) => hireSupervisor(payload),
  })
}

export function useHiresList(page = 1, limit = 10) {
  return useQuery({
    queryKey: hireKeys.list(page, limit),
    queryFn: () => listHires(page, limit),
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

export function useAcceptHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hireId: string) => acceptHire(hireId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}

export function useRejectHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ hireId, reason }: { hireId: string; reason: string }) =>
      rejectHire(hireId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}

export function useCancelHire() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hireId: string) => cancelHire(hireId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hireKeys.all })
    },
  })
}
