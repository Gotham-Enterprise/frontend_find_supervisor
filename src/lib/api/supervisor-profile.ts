import type { ApiResponse } from '@/types'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

import { apiClient } from './client'

export async function getSupervisorProfile(): Promise<SupervisorProfileData> {
  const { data } = await apiClient.get<ApiResponse<SupervisorProfileData>>(
    '/supervision/supervisor/profile',
  )
  return data.data
}
