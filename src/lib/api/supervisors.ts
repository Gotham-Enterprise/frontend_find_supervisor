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
  const { data } = await apiClient.get<ApiResponse<Supervisor>>(`/supervisors/${id}`)
  return data.data
}
