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

export interface UpdateSuperviseeProfilePayload {
  fullName?: string
  contactNumber?: string
  city?: string
  state?: string
  zipcode?: string
  occupation?: string
  specialty?: string
  stateOfLicensure?: string[]
  typeOfSupervisorNeeded?: string
  howSoonLooking?: string
  lookingDate?: string
  preferredFormat?: string
  availability?: string
  idealSupervisor?: string
  stateTheyAreLookingIn?: string
  budgetRangeType?: string
  budgetRangeStart?: number
  budgetRangeEnd?: number
  uploadProfilePhoto?: File
}

/** PUT /supervision/supervisee/profile — update the authenticated supervisee's own profile. */
export async function updateSuperviseeProfile(
  payload: UpdateSuperviseeProfilePayload,
): Promise<SuperviseeProfileData> {
  const fd = new FormData()

  const { uploadProfilePhoto, stateOfLicensure, budgetRangeStart, budgetRangeEnd, ...rest } =
    payload

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, String(value))
    }
  }

  if (budgetRangeStart !== undefined) {
    fd.append('budgetRangeStart', String(budgetRangeStart))
  }

  if (budgetRangeEnd !== undefined) {
    fd.append('budgetRangeEnd', String(budgetRangeEnd))
  }

  if (stateOfLicensure) {
    stateOfLicensure.forEach((s) => fd.append('stateOfLicensure', s))
  }

  if (uploadProfilePhoto) {
    fd.append('uploadProfilePhoto', uploadProfilePhoto)
  }

  const { data } = await apiClient.put<ApiResponse<SuperviseeProfileData>>(
    '/supervision/supervisee/profile',
    fd,
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}
