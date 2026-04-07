'use client'

import { useMutation, useQuery } from '@tanstack/react-query'

import { hireSupervisor, listHires } from '@/lib/api/supervision'
import type { HireSupervisorPayload } from '@/types/hire'

export const hireKeys = {
  all: ['hires'] as const,
  list: (page: number, limit: number) => [...hireKeys.all, 'list', page, limit] as const,
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
