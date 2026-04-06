import type { ApiResponse } from '@/types'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

import { apiClient } from './client'

/**
 * GET /supervision/supervisee/profile?id=<userId>
 * Authenticated — returns the supervisee's own profile by userId.
 */
export async function getSuperviseeProfile(userId: string): Promise<SuperviseeProfileData> {
  const { data } = await apiClient.get<ApiResponse<SuperviseeProfileData>>(
    '/supervision/supervisee/profile',
    { params: { id: userId } },
  )
  return data.data
}
