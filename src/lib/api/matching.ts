import type {
  ApiResponse,
  CreateMatchingRequestDto,
  MatchingRequest,
  PaginatedResponse,
} from '@/types'

import { apiClient } from './client'

export interface GetMatchingRequestsParams {
  page?: number
  pageSize?: number
  status?: string
}

export async function getMatchingRequests(
  params?: GetMatchingRequestsParams,
): Promise<PaginatedResponse<MatchingRequest>> {
  const { data } = await apiClient.get<PaginatedResponse<MatchingRequest>>('/matching-requests', {
    params,
  })
  return data
}

export async function createMatchingRequest(
  dto: CreateMatchingRequestDto,
): Promise<MatchingRequest> {
  const { data } = await apiClient.post<ApiResponse<MatchingRequest>>('/matching-requests', dto)
  return data.data
}

export async function updateMatchingRequestStatus(
  id: string,
  status: 'accepted' | 'rejected' | 'cancelled',
): Promise<MatchingRequest> {
  const { data } = await apiClient.patch<ApiResponse<MatchingRequest>>(
    `/matching-requests/${id}/status`,
    { status },
  )
  return data.data
}
