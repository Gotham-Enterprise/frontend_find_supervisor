import { z } from 'zod'

import type { UpdateSupervisorProfilePayload } from '@/lib/api/supervisor-profile'
import { normalizeUSPhoneNumber } from '@/lib/utils/phone'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

export const SUPERVISOR_PROFILE_FORMAT_OPTIONS = [
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Hybrid', value: 'HYBRID' },
] as const

export const SUPERVISOR_PROFILE_FEE_TYPE_OPTIONS = [
  { label: 'Hourly', value: 'HOURLY' },
  { label: 'Monthly', value: 'MONTHLY' },
] as const

export const editSupervisorProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  contactNumber: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipcode: z
    .string()
    .max(10)
    .optional()
    .refine((v) => !v || /^\d{5}(-\d{4})?$/.test(v), 'Enter a valid US zipcode'),
  website: z
    .string()
    .max(200)
    .optional()
    .refine((v) => !v || /^https?:\/\/\S+/.test(v), 'Enter a valid URL (e.g. https://example.com)'),
  occupationId: z.string().optional(),
  specialtyId: z.string().optional(),
  licenseType: z.string().optional(),
  licenseNumber: z.string().max(50).optional(),
  licenseExpiration: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  npiNumber: z.string().max(20).optional(),
  certification: z.array(z.string()).optional(),
  stateOfLicensure: z.array(z.string()).optional(),
  patientPopulation: z.array(z.string()).optional(),
  supervisionFormat: z.string().optional(),
  availability: z.string().optional(),
  acceptingSupervisees: z.boolean().optional(),
  describeYourself: z.string().max(500).optional(),
  professionalSummary: z.string().max(500).optional(),
  supervisionFeeType: z.string().optional(),
  supervisionFeeAmount: z.number().optional(),
  uploadProfilePhoto: z.any().optional(),
})

export type EditSupervisorProfileFormValues = z.infer<typeof editSupervisorProfileSchema>

export function getDefaultSupervisorProfileFormValues(
  profile: SupervisorProfileData,
): EditSupervisorProfileFormValues {
  const defaultOccupationId = String(
    profile.occupationId ?? profile.occupation?.id ?? profile.user.occupation?.id ?? '',
  )
  const defaultSpecialtyId = String(
    profile.specialtyId ?? profile.specialty?.id ?? profile.user.specialty?.id ?? '',
  )

  return {
    fullName: profile.user.fullName ?? '',
    contactNumber: profile.user.contactNumber ?? '',
    city: profile.user.city ?? '',
    state: profile.user.state ?? '',
    zipcode: profile.user.zipcode ?? '',
    website: profile.website ?? '',
    occupationId: defaultOccupationId,
    specialtyId: defaultSpecialtyId,
    licenseType: profile.licenseType ?? '',
    licenseNumber: profile.licenseNumber ?? '',
    licenseExpiration: profile.licenseExpiration ? profile.licenseExpiration.slice(0, 10) : '',
    yearsOfExperience: profile.yearsOfExperience ?? '',
    npiNumber: profile.npiNumber ?? '',
    certification: profile.certification ?? [],
    stateOfLicensure: profile.user.stateOfLicensure ?? [],
    patientPopulation: profile.patientPopulation ?? [],
    supervisionFormat: profile.supervisionFormat ?? '',
    availability: profile.availability ?? '',
    acceptingSupervisees: profile.acceptingSupervisees,
    describeYourself: profile.describeYourself ?? '',
    professionalSummary: profile.professionalSummary ?? '',
    supervisionFeeType: profile.supervisionFeeType ?? '',
    supervisionFeeAmount: profile.supervisionFeeAmount ?? undefined,
    uploadProfilePhoto: undefined,
  }
}

export function supervisorProfileFormValuesToPayload(
  values: EditSupervisorProfileFormValues,
): UpdateSupervisorProfilePayload {
  return {
    fullName: values.fullName,
    contactNumber: values.contactNumber
      ? (normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
      : undefined,
    city: values.city,
    state: values.state,
    zipcode: values.zipcode || undefined,
    website: values.website || undefined,
    occupation: values.occupationId || undefined,
    specialty: values.specialtyId || undefined,
    licenseType: values.licenseType || undefined,
    licenseNumber: values.licenseNumber || undefined,
    licenseExpiration: values.licenseExpiration || undefined,
    yearsOfExperience: values.yearsOfExperience || undefined,
    npiNumber: values.npiNumber || undefined,
    certification: values.certification,
    stateOfLicensure: values.stateOfLicensure,
    patientPopulation: values.patientPopulation,
    supervisionFormat: values.supervisionFormat || undefined,
    availability: values.availability || undefined,
    acceptingSupervisees: values.acceptingSupervisees,
    describeYourself: values.describeYourself || undefined,
    professionalSummary: values.professionalSummary || undefined,
    supervisionFeeType: values.supervisionFeeType || undefined,
    supervisionFeeAmount: values.supervisionFeeAmount,
    uploadProfilePhoto:
      values.uploadProfilePhoto instanceof File ? values.uploadProfilePhoto : undefined,
  }
}
