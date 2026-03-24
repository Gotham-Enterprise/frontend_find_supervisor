import { useQuery } from '@tanstack/react-query'

import { fetchOccupations } from '@/lib/api/categoriesApi'

export const categoryKeys = {
  all: ['categories'] as const,
  occupations: (params?: { limit?: number; skip?: number; hasJob?: boolean; sortBy?: string }) =>
    [...categoryKeys.all, 'occupations', params] as const,
}

/**
 * Same endpoint as frontend_job_finder `useOccupations` — GET /api/categories/occupations.
 */
export function useOccupations(params?: {
  limit?: number
  skip?: number
  hasJob?: boolean
  sortBy?: string
}) {
  return useQuery({
    queryKey: categoryKeys.occupations({ ...params }),
    queryFn: () => fetchOccupations(params),
    staleTime: 2 * 60 * 1000,
  })
}
