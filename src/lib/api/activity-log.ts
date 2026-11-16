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

/**
 * The entry as multipart/form-data: its fields (empty ones left out, which the
 * backend reads as "not recorded"), files to add under "attachments", and ids
 * to remove under "removeAttachmentIds" (repeated).
 */
export function toEntryFormData(input: ActivityEntryInput): FormData {
  const form = new FormData()
  form.append('activityDate', input.activityDate)
  form.append('type', input.type)
  if (input.durationMinutes != null) form.append('durationMinutes', String(input.durationMinutes))
  if (input.chartCount != null) form.append('chartCount', String(input.chartCount))
  if (input.notes) form.append('notes', input.notes)
  input.attachments?.forEach((file) => form.append('attachments', file))
  input.removeAttachmentIds?.forEach((id) => form.append('removeAttachmentIds', id))
  return form
}

// Unset the client's JSON default so axios sends real multipart/form-data.
const MULTIPART = { headers: { 'Content-Type': undefined } }

/** POST /supervision/hires/:hireId/activity-log — Medical Director only. */
export async function createActivityEntry(
  hireId: string,
  input: ActivityEntryInput,
): Promise<HireActivityLog> {
  const { data } = await apiClient.post<ApiResponse<HireActivityLog>>(
    `/supervision/hires/${hireId}/activity-log`,
    toEntryFormData(input),
    MULTIPART,
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
    toEntryFormData(input),
    MULTIPART,
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

/**
 * GET /supervision/hires/:hireId/activity-log/export — the log as a PDF or
 * CSV file, oldest first; `from`/`to` ("YYYY-MM-DD") narrow it. Either side.
 */
export async function exportActivityLog(
  hireId: string,
  params: { format: 'pdf' | 'csv'; from?: string; to?: string },
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/supervision/hires/${hireId}/activity-log/export`, {
    params,
    responseType: 'blob',
  })
  return data
}
