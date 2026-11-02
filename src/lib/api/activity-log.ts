import type { ActivityEntryInput, HireActivityLog } from '@/types/activity-log'
import type { ApiResponse } from '@/types/api'

import { apiClient } from './client'

/** Medical Director activity log of one hire. Every write returns the whole log. */

/** GET /supervision/hires/:hireId/activity-log */
export async function getHireActivityLog(hireId: string): Promise<HireActivityLog> {
  const { data } = await apiClient.get<ApiResponse<HireActivityLog>>(
    `/supervision/hires/${hireId}/activity-log`,
  )
  return data.data
}

/** POST /supervision/hires/:hireId/activity-log — Medical Director only. */
export async function createActivityEntry(
  hireId: string,
  input: ActivityEntryInput,
): Promise<HireActivityLog> {
  const { data } = await apiClient.post<ApiResponse<HireActivityLog>>(
    `/supervision/hires/${hireId}/activity-log`,
    input,
  )
  return data.data
}

/** PATCH /supervision/hires/:hireId/activity-log/:entryId — Medical Director only. */
export async function updateActivityEntry(
  hireId: string,
  entryId: string,
  input: ActivityEntryInput,
): Promise<HireActivityLog> {
  const { data } = await apiClient.patch<ApiResponse<HireActivityLog>>(
    `/supervision/hires/${hireId}/activity-log/${entryId}`,
    input,
  )
  return data.data
}

/** DELETE /supervision/hires/:hireId/activity-log/:entryId — Medical Director only. */
export async function deleteActivityEntry(
  hireId: string,
  entryId: string,
): Promise<HireActivityLog> {
  const { data } = await apiClient.delete<ApiResponse<HireActivityLog>>(
    `/supervision/hires/${hireId}/activity-log/${entryId}`,
  )
  return data.data
}
