'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getRecommendedSupervisors,
  type GetRecommendedSupervisorsParams,
  type RecommendedSupervisorsPageData,
} from '@/lib/api/supervisors'

export const recommendedSupervisorKeys = {
  all: ['recommended-supervisors'] as const,
  list: (params?: GetRecommendedSupervisorsParams) =>
    [...recommendedSupervisorKeys.all, 'list', params] as const,
}

export function useRecommendedSupervisors(params?: GetRecommendedSupervisorsParams) {
  return useQuery<RecommendedSupervisorsPageData>({
    queryKey: recommendedSupervisorKeys.list(params),
    queryFn: () => getRecommendedSupervisors(params),
    staleTime: 5 * 60 * 1000,
  })
}
