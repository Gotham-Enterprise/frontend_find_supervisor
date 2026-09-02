import type { ApiResponse } from '@/types'
import type { SuperviseeProfileData, SuperviseeProfileViewData } from '@/types/supervisee-profile'

import { apiClient } from './client'

/**
 * GET /supervision/supervisee/profile?id=<userId>
 * Authenticated — returns the supervisee profile by userId.
 */
export async function getSuperviseeProfile(userId: string): Promise<SuperviseeProfileViewData> {
  const { data } = await apiClient.get<ApiResponse<SuperviseeProfileViewData>>(
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
  title?: string
  licensureState?: string
  stateOfLicensure?: string[]
  typeOfSupervisorNeeded?: string[]
  superviseeOccupation?: string
  superviseeSpecialty?: string
  howSoonLooking?: string
  lookingDate?: string
  preferredFormat?: string
  availability?: string
  idealSupervisor?: string
  budgetRangeType?: string
  budgetRangeStart?: number
  budgetRangeEnd?: number
  mdPreferredOccupation?: string
  mdPreferredSpecialty?: string
  mdHowSoonLooking?: string
  mdLookingDate?: string
  mdMonthlyBudget?: number
  mdIdealDescription?: string
  introduction?: string
  uploadProfilePhoto?: File
}

/** PUT /supervision/supervisee/profile — update the authenticated supervisee's own profile. */
export async function updateSuperviseeProfile(
  payload: UpdateSuperviseeProfilePayload,
): Promise<SuperviseeProfileData> {
  const fd = new FormData()

  const {
    uploadProfilePhoto,
    stateOfLicensure,
    typeOfSupervisorNeeded,
    budgetRangeStart,
    budgetRangeEnd,
    superviseeOccupation,
    superviseeSpecialty,
    mdPreferredOccupation,
    mdPreferredSpecialty,
    mdMonthlyBudget,
    introduction,
    ...rest
  } = payload

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, String(value))
    }
  }

  // Sent even when empty — the backend nulls the stored value for a present-but-empty
  // field, which is how a Medical Director-only request clears the previous type's
  // occupation/specialty. Omitting them (undefined) leaves the stored values untouched.
  if (superviseeOccupation !== undefined) {
    fd.append('superviseeOccupation', superviseeOccupation)
  }
  if (superviseeSpecialty !== undefined) {
    fd.append('superviseeSpecialty', superviseeSpecialty)
  }

  // Same present-but-empty semantics for the Medical Director preference selects.
  if (mdPreferredOccupation !== undefined) {
    fd.append('mdPreferredOccupation', mdPreferredOccupation)
  }
  if (mdPreferredSpecialty !== undefined) {
    fd.append('mdPreferredSpecialty', mdPreferredSpecialty)
  }
  if (mdMonthlyBudget !== undefined) {
    fd.append('mdMonthlyBudget', String(mdMonthlyBudget))
  }
  // Present-but-empty clears the stored introduction (it is optional and erasable).
  if (introduction !== undefined) {
    fd.append('introduction', introduction)
  }

  if (budgetRangeStart !== undefined) {
    fd.append('budgetRangeStart', String(budgetRangeStart))
  }

  if (budgetRangeEnd !== undefined) {
    fd.append('budgetRangeEnd', String(budgetRangeEnd))
  }

  if (stateOfLicensure?.length) {
    stateOfLicensure.forEach((s) => fd.append('stateOfLicensure[]', s))
  }

  if (typeOfSupervisorNeeded?.length) {
    typeOfSupervisorNeeded.forEach((t) => fd.append('typeOfSupervisorNeeded[]', t))
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
