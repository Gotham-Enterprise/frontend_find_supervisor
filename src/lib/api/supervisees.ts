import { apiClient } from './client'
import type { PaginatedResponse, Supervisee } from '@/types'

export interface GetSuperviseesParams {
  page?: number
  pageSize?: number
  department?: string
  supervisorId?: string
}

export async function getSupervisees(
  params?: GetSuperviseesParams,
): Promise<PaginatedResponse<Supervisee>> {
  const { data } = await apiClient.get<PaginatedResponse<Supervisee>>('/supervisees', {
    params,
  })
  return data
}
