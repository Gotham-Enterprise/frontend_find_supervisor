import { z } from 'zod'

import { yearsOfExperienceOptions } from '@/components/Signup/schema'
import type { UpdateSupervisorProfilePayload } from '@/lib/api/supervisor-profile'
import { normalizeNumberFieldInput } from '@/lib/utils/number-input'
import { formatUSPhoneForDisplay, normalizeUSPhoneNumber } from '@/lib/utils/phone'
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

const SUPERVISION_FORMAT_VALUES = ['VIRTUAL', 'IN_PERSON', 'HYBRID'] as const

function isEmptySelect(value: string | undefined): boolean {
  return !value?.trim() || value === '__none__'
}

const licenseExpirationRefine = z
  .string()
  .min(1, 'Expiration date is required')
  .refine(
    (val) => {
      const date = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      return date >= today
    },
    { message: 'License expiration cannot be a past date' },
  )

/**
 * Field rules aligned with {@link supervisorSchema} / supervisor signup (excluding account
 * creation-only fields: email, password, agreements, new license file upload).
 */
const editSupervisorProfileFieldsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  contactNumber: z.string().min(1, 'Contact number is required'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required'),
  zipcode: z
    .string()
    .min(5, 'Zipcode must be at least 5 digits')
    .max(10)
    .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid US zipcode'),
  website: z
    .string()
    .max(200)
    .optional()
    .refine((v) => !v || v.length === 0 || /^https?:\/\/\S+/.test(v), {
      message: 'Please enter a valid URL (e.g. https://example.com)',
    }),
  occupationId: z
    .string()
    .min(1, 'Occupation is required')
    .refine((s) => !isEmptySelect(s), { message: 'Occupation is required' }),
  specialtyId: z.string().optional(),
  licenseType: z
    .string()
    .min(1, 'License type is required')
    .refine((s) => !isEmptySelect(s), { message: 'License type is required' }),
  licenseNumber: z.string().min(1, 'License number is required').max(50),
  licenseExpiration: licenseExpirationRefine,
  yearsOfExperience: z
    .string()
    .min(1, 'Years of experience is required')
    .refine((v) => (yearsOfExperienceOptions as readonly string[]).includes(v), {
      message: 'Please select years of experience',
    }),
  npiNumber: z.string().max(20).optional(),
  certification: z.array(z.string()).min(1, 'Add at least one certification'),
  stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
  patientPopulation: z.array(z.string()).min(1, 'Add at least one patient population'),
  supervisionFormat: z
    .string()
    .min(1, 'Please select a supervision format')
    .refine(
      (s) => !isEmptySelect(s) && (SUPERVISION_FORMAT_VALUES as readonly string[]).includes(s),
      { message: 'Please select a supervision format' },
    ),
  availability: z
    .string()
    .min(1, 'Availability is required')
    .refine((s) => !isEmptySelect(s), { message: 'Availability is required' }),
  acceptingSupervisees: z.boolean().optional(),
  describeYourself: z
    .string()
    .min(20, 'Describe yourself must be at least 20 characters')
    .max(500, 'Describe yourself must be 500 characters or less'),
  professionalSummary: z
    .string()
    .min(20, 'Professional summary must be at least 20 characters')
    .max(500, 'Professional summary must be 500 characters or less'),
  supervisionFeeType: z.enum(['HOURLY', 'MONTHLY'], {
    message: 'Please select a fee type',
  }),
  supervisionFeeAmount: z.preprocess(
    normalizeNumberFieldInput,
    z.number('Please enter a fee amount').min(1, 'Fee amount must be at least $1'),
  ),
  uploadProfilePhoto: z.any().optional(),
})

export type EditSupervisorProfileFormValues = z.infer<typeof editSupervisorProfileFieldsSchema>

/**
 * Same validation as supervisor signup for overlapping fields, plus: require a profile photo
 * (existing URL from signup or a newly selected file).
 */
export function createEditSupervisorProfileSchema(profile: SupervisorProfileData) {
  return editSupervisorProfileFieldsSchema.superRefine((data, ctx) => {
    const hasNewPhoto = data.uploadProfilePhoto instanceof File
    const hasExisting = Boolean(profile.user.profilePhotoUrl?.trim())
    if (!hasNewPhoto && !hasExisting) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please upload a profile photo',
        path: ['uploadProfilePhoto'],
      })
    }
  })
}

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
    contactNumber: formatUSPhoneForDisplay(profile.user.contactNumber ?? ''),
    city: profile.user.city ?? '',
    state: profile.user.state ?? '',
    zipcode: profile.user.zipcode ?? '',
    website: profile.website ?? '',
    occupationId: defaultOccupationId,
    specialtyId: defaultSpecialtyId,
    licenseType: profile.licenseType ?? '',
    licenseNumber: profile.licenseNumber ?? '',
    licenseExpiration: profile.licenseExpiration ? profile.licenseExpiration.slice(0, 10) : '',
    yearsOfExperience: (() => {
      const raw = profile.yearsOfExperience?.trim() ?? ''
      return (yearsOfExperienceOptions as readonly string[]).includes(raw) ? raw : ''
    })(),
    npiNumber: profile.npiNumber ?? '',
    certification: profile.certification ?? [],
    stateOfLicensure: profile.user.stateOfLicensure ?? [],
    patientPopulation: profile.patientPopulation ?? [],
    supervisionFormat: profile.supervisionFormat ?? '',
    availability: profile.availability ?? '',
    acceptingSupervisees: profile.acceptingSupervisees,
    describeYourself: profile.describeYourself ?? '',
    professionalSummary: profile.professionalSummary ?? '',
    supervisionFeeType: (profile.supervisionFeeType === 'MONTHLY' ||
    profile.supervisionFeeType === 'HOURLY'
      ? profile.supervisionFeeType
      : 'HOURLY') as 'HOURLY' | 'MONTHLY',
    supervisionFeeAmount: profile.supervisionFeeAmount ?? 0,
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
    occupation:
      values.occupationId && values.occupationId !== '__none__' ? values.occupationId : undefined,
    specialty:
      values.specialtyId && values.specialtyId !== '__none__' ? values.specialtyId : undefined,
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
