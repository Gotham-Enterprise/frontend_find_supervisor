import type { ApiResponse, PaginatedResponse, Supervisor } from '@/types'

import { apiClient } from './client'

export interface GetSupervisorsParams {
  page?: number
  pageSize?: number
  department?: string
  available?: boolean
}

export async function getSupervisors(
  params?: GetSupervisorsParams,
): Promise<PaginatedResponse<Supervisor>> {
  const { data } = await apiClient.get<PaginatedResponse<Supervisor>>('/supervisors', {
    params,
  })
  return data
}

export async function getSupervisorById(id: string): Promise<Supervisor> {
  const { data } = await apiClient.get<ApiResponse<Supervisor>>(
    `/supervision/supervisor/profile?id=${id}`,
  )
  return data.data
}

// ---------------------------------------------------------------------------
// Recommended supervisors (GET /api/supervision/recommended-supervisors)
// ---------------------------------------------------------------------------

/** Raw item shape returned by the backend scoring engine. */
export interface RecommendedSupervisorApiItem {
  id: string
  fullName: string
  stateOfLicensure: string[]
  occupation: { id: string; name: string } | null
  specialty: { id: string; name: string } | null
  supervisorProfile: {
    profession: string | null
    supervisionFormat: string | null
    availability: string | null
    supervisionFeeAmount: number | null
    totalCompletedSupervision: number | null
  } | null
  recommendationScore: number
  recommendationReasons: string[]
  averageRating: number
  totalReviews: number
  existingHireRequest: Record<string, unknown> | null
}

export interface RecommendedSupervisorsPageData {
  items: RecommendedSupervisorApiItem[]
  totalCount: number
  currentPage: number
  totalPages: number
}

interface RecommendedSupervisorsApiResponse {
  success: boolean
  data: RecommendedSupervisorsPageData
}

export interface GetRecommendedSupervisorsParams {
  page?: number
  limit?: number
}

export async function getRecommendedSupervisors(
  params?: GetRecommendedSupervisorsParams,
): Promise<RecommendedSupervisorsPageData> {
  const { data } = await apiClient.get<RecommendedSupervisorsApiResponse>(
    '/supervision/recommended-supervisors',
    { params },
  )
  return data.data
}
