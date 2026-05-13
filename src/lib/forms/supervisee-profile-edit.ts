import { z } from 'zod'

import type { UpdateSuperviseeProfilePayload } from '@/lib/api/supervisee-profile'
import { formatUSPhoneForDisplay, normalizeUSPhoneNumber } from '@/lib/utils/phone'
import { coerceStringList } from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

export const SUPERVISEE_PROFILE_FORMAT_OPTIONS = [
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Hybrid', value: 'HYBRID' },
] as const

export const SUPERVISEE_PROFILE_BUDGET_TYPE_OPTIONS = [
  { label: 'Per Session', value: 'PER_SESSION' },
  { label: 'Monthly', value: 'MONTHLY' },
] as const

export const editSuperviseeProfileSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required').max(100),
    contactNumber: z.string().min(1, 'Contact number is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipcode: z
      .string()
      .min(5, 'Zipcode must be at least 5 digits')
      .max(10)
      .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid US zipcode'),
    occupationId: z.string().min(1, 'Occupation is required'),
    specialtyId: z.string().optional(),
    stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
    typeOfSupervisorNeeded: z
      .array(z.string())
      .min(1, 'Please select at least one type of supervision needed'),
    howSoonLooking: z.string().min(1, 'Please select how soon you need a supervisor'),
    lookingDate: z.string().optional(),
    preferredFormat: z.string().min(1, 'Preferred format is required'),
    availability: z.string().min(1, 'Availability is required'),
    idealSupervisor: z.string().min(1, 'Description of ideal supervisor is required').max(500),
    stateTheyAreLookingIn: z
      .array(z.string())
      .min(1, 'Please select at least one state you are looking in'),
    budgetRangeType: z.string().min(1, 'Budget type is required'),
    budgetRangeStart: z.number().min(0).optional(),
    budgetRangeEnd: z.number().min(0).optional(),
    uploadProfilePhoto: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.howSoonLooking === 'CUSTOM_DATE' && !data.lookingDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['lookingDate'],
        message: 'Please select a date',
      })
    }
  })

export type EditSuperviseeProfileFormValues = z.infer<typeof editSuperviseeProfileSchema>

export function getDefaultSuperviseeProfileFormValues(
  profile: SuperviseeProfileData,
): EditSuperviseeProfileFormValues {
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
    occupationId: defaultOccupationId,
    specialtyId: defaultSpecialtyId,
    stateOfLicensure: profile.user.stateOfLicensure ?? [],
    typeOfSupervisorNeeded: coerceStringList(profile.typeOfSupervisorNeeded),
    howSoonLooking: profile.howSoonLooking ?? '',
    lookingDate: profile.lookingDate ? profile.lookingDate.slice(0, 10) : '',
    preferredFormat: profile.preferredFormat ?? '',
    availability: profile.availability ?? '',
    idealSupervisor: profile.idealSupervisor ?? '',
    stateTheyAreLookingIn: coerceStringList(profile.stateTheyAreLookingIn),
    budgetRangeType: profile.budgetRangeType ?? '',
    budgetRangeStart: profile.budgetRangeStart ?? undefined,
    budgetRangeEnd: profile.budgetRangeEnd ?? undefined,
    uploadProfilePhoto: undefined,
  }
}

export function superviseeProfileFormValuesToPayload(
  values: EditSuperviseeProfileFormValues,
): UpdateSuperviseeProfilePayload {
  return {
    fullName: values.fullName,
    contactNumber: values.contactNumber
      ? (normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
      : undefined,
    city: values.city,
    state: values.state,
    zipcode: values.zipcode || undefined,
    occupation: values.occupationId || undefined,
    specialty: values.specialtyId || undefined,
    stateOfLicensure: values.stateOfLicensure,
    typeOfSupervisorNeeded:
      values.typeOfSupervisorNeeded.length > 0 ? values.typeOfSupervisorNeeded : undefined,
    howSoonLooking: values.howSoonLooking || undefined,
    lookingDate:
      values.howSoonLooking === 'CUSTOM_DATE' ? values.lookingDate || undefined : undefined,
    preferredFormat: values.preferredFormat || undefined,
    availability: values.availability || undefined,
    idealSupervisor: values.idealSupervisor || undefined,
    stateTheyAreLookingIn:
      values.stateTheyAreLookingIn.length > 0 ? values.stateTheyAreLookingIn : undefined,
    budgetRangeType: values.budgetRangeType || undefined,
    budgetRangeStart: values.budgetRangeStart,
    budgetRangeEnd: values.budgetRangeEnd,
    uploadProfilePhoto:
      values.uploadProfilePhoto instanceof File ? values.uploadProfilePhoto : undefined,
  }
}
