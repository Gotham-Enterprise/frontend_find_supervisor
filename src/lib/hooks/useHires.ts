'use client'

import { useMutation } from '@tanstack/react-query'

import { hireSupervisor } from '@/lib/api/supervision'
import type { HireSupervisorPayload } from '@/types/hire'

export function useHireSupervisor() {
  return useMutation({
    mutationFn: (payload: HireSupervisorPayload) => hireSupervisor(payload),
  })
}
