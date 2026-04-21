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

export interface UpdateSupervisorProfilePayload {
  fullName?: string
  contactNumber?: string
  city?: string
  state?: string
  zipcode?: string
  occupation?: string
  specialty?: string
  website?: string
  licenseType?: string
  licenseNumber?: string
  licenseExpiration?: string
  yearsOfExperience?: string
  npiNumber?: string
  certification?: string[]
  stateOfLicensure?: string[]
  patientPopulation?: string[]
  supervisionFormat?: string
  availability?: string
  acceptingSupervisees?: boolean
  describeYourself?: string
  supervisionFeeType?: string
  supervisionFeeAmount?: number
  professionalSummary?: string
  uploadProfilePhoto?: File
  uploadLicense?: File
}

/** PUT /supervision/supervisor/profile — update the authenticated supervisor's own profile. */
export async function updateSupervisorProfile(
  payload: UpdateSupervisorProfilePayload,
): Promise<SupervisorProfileData> {
  const fd = new FormData()

  const {
    uploadProfilePhoto,
    uploadLicense,
    certification,
    stateOfLicensure,
    patientPopulation,
    acceptingSupervisees,
    supervisionFeeAmount,
    ...rest
  } = payload

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, String(value))
    }
  }

  if (acceptingSupervisees !== undefined) {
    fd.append('acceptingSupervisees', String(acceptingSupervisees))
  }

  if (supervisionFeeAmount !== undefined) {
    fd.append('supervisionFeeAmount', String(supervisionFeeAmount))
  }

  if (certification) {
    certification.forEach((c) => fd.append('certification', c))
  }

  if (stateOfLicensure) {
    stateOfLicensure.forEach((s) => fd.append('stateOfLicensure', s))
  }

  if (patientPopulation) {
    patientPopulation.forEach((p) => fd.append('patientPopulation', p))
  }

  if (uploadProfilePhoto) {
    fd.append('uploadProfilePhoto', uploadProfilePhoto)
  }

  if (uploadLicense) {
    fd.append('uploadLicense', uploadLicense)
  }

  const { data } = await apiClient.put<ApiResponse<SupervisorProfileData>>(
    '/supervision/supervisor/profile',
    fd,
    { headers: { 'Content-Type': undefined } },
  )
  return data.data
}
