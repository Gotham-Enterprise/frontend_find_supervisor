import type { ApiResponse } from '@/types'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

import { apiClient } from './client'

/** GET /supervision/supervisor/profile?id=<id> — supervisor profile for that userId (own profile uses `useUser().id`). */
export async function getSupervisorProfileById(id: string): Promise<SupervisorProfileData> {
  const { data } = await apiClient.get<ApiResponse<SupervisorProfileData>>(
    '/supervision/supervisor/profile',
    { params: { id } },
  )
  return data.data
}
