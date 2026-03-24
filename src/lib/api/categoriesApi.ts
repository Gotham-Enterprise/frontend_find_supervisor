import type { CategoriesApiResponse, Occupation } from '@/lib/types/categories'

import { apiClient } from './client'

/**
 * GET /api/categories/occupations — same contract as frontend_job_finder
 * (`lib/api/categoriesApi.fetchOccupationsApi`).
 */
export async function fetchOccupations(params?: {
  limit?: number
  skip?: number
  hasJob?: boolean
  sortBy?: string
}): Promise<CategoriesApiResponse<Occupation[]>> {
  const { data } = await apiClient.get<CategoriesApiResponse<Occupation[]>>(
    '/categories/occupations',
    { params },
  )
  return data
}
