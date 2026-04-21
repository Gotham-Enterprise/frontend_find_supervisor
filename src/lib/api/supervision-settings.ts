import type { ApiResponse } from '@/types'

import { apiClient } from './client'

export interface SupervisionSettings {
  notificationAlert: boolean
  canMessage: boolean
  hideProfile?: boolean
  disabledMessageInfo: string | null
  emailAlert: boolean
}

export interface UpdateSupervisionSettingsPayload {
  notificationAlert?: boolean
  canMessage?: boolean
  /** Required by the API when canMessage is false. */
  disabledMessageInfo?: string
  hideProfile?: boolean
  emailAlert?: boolean
}

/** GET /supervision/settings — fetch the authenticated user's notification/visibility settings. */
export async function getSupervisionSettings(): Promise<SupervisionSettings> {
  const { data } = await apiClient.get<ApiResponse<SupervisionSettings>>('/supervision/settings')
  return data.data
}

/** PATCH /supervision/settings — update the authenticated user's settings. */
export async function updateSupervisionSettings(
  payload: UpdateSupervisionSettingsPayload,
): Promise<SupervisionSettings> {
  const { data } = await apiClient.patch<ApiResponse<SupervisionSettings>>(
    '/supervision/settings',
    payload,
  )
  return data.data
}
