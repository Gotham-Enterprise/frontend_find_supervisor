import { z } from 'zod'

import type { UpdateSuperviseeProfilePayload } from '@/lib/api/supervisee-profile'
import { normalizeNumberFieldInput } from '@/lib/utils/number-input'
import { formatUSPhoneForDisplay, normalizeUSPhoneNumber } from '@/lib/utils/phone'
import { coerceStringList } from '@/lib/utils/profile-formatters'
import {
  isMedicalDirectorType,
  MEDICAL_DIRECTOR_TYPE_NAME,
  SUPERVISION_TYPE_REQUIRED_MESSAGE,
} from '@/lib/utils/supervisee-eligibility'
import type { SuperviseeProfileData } from '@/types/supervisee-profile'

export const SUPERVISEE_PROFILE_FORMAT_OPTIONS = [
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Hybrid', value: 'HYBRID' },
] as const

export const SUPERVISEE_PROFILE_BUDGET_TYPE_OPTIONS = [
  { label: 'Hourly', value: 'HOURLY' },
  { label: 'Monthly', value: 'MONTHLY' },
] as const

export const SUPERVISEE_CREDENTIAL_TITLE_LABEL = 'Credential or License Type'
export const SUPERVISEE_CREDENTIAL_TITLE_PLACEHOLDER = 'e.g. AMFT, LPC-Associate, ACSW, PA'

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
    title: z.string().min(1, 'Credential or license type is required').max(100),
    // State tied to the credential (US state abbreviation, e.g. "TX") — matches signup
    licensureState: z.string().min(1, 'State of licensure is required'),
    stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
    // Required unless `needsMedicalDirector` is checked — enforced in the superRefine below.
    typeOfSupervisorNeeded: z.string(),
    // Medical Director is requested via a checkbox rather than the dropdown, since it can
    // be combined with any supervision type or requested on its own (matches signup).
    needsMedicalDirector: z.boolean().default(false),
    // Required only when a supervision type is selected (it cascades from the type).
    superviseeOccupation: z.string(),
    superviseeSpecialty: z.string().optional(),
    howSoonLooking: z.string().min(1, 'Please select how soon you need a supervisor'),
    lookingDate: z.string().optional(),
    preferredFormat: z.string().min(1, 'Preferred format is required'),
    availability: z.string().min(1, 'Availability is required'),
    idealSupervisor: z.string().min(1, 'Description of ideal supervisor is required').max(500),
    budgetRangeType: z.string().min(1, 'Budget type is required'),
    budgetRangeStart: z.preprocess(normalizeNumberFieldInput, z.number().min(0).optional()),
    budgetRangeEnd: z.preprocess(normalizeNumberFieldInput, z.number().min(0).optional()),
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
    if (!data.typeOfSupervisorNeeded && !data.needsMedicalDirector) {
      ctx.addIssue({
        code: 'custom',
        path: ['typeOfSupervisorNeeded'],
        message: SUPERVISION_TYPE_REQUIRED_MESSAGE,
      })
    }
    if (data.typeOfSupervisorNeeded && !data.superviseeOccupation) {
      ctx.addIssue({
        code: 'custom',
        path: ['superviseeOccupation'],
        message: 'Occupation is required',
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

  // The stored array holds at most one supervision type plus, optionally, Medical
  // Director — split back into the dropdown value and the checkbox.
  const storedSupervisionTypes = coerceStringList(profile.typeOfSupervisorNeeded)

  return {
    fullName: profile.user.fullName ?? '',
    contactNumber: formatUSPhoneForDisplay(profile.user.contactNumber ?? ''),
    city: profile.user.city ?? '',
    state: profile.user.state ?? '',
    zipcode: profile.user.zipcode ?? '',
    occupationId: defaultOccupationId,
    specialtyId: defaultSpecialtyId,
    title: profile.title ?? '',
    licensureState: profile.licensureState ?? '',
    stateOfLicensure: profile.user.stateOfLicensure ?? [],
    typeOfSupervisorNeeded:
      storedSupervisionTypes.find((name) => !isMedicalDirectorType({ name })) ?? '',
    needsMedicalDirector: storedSupervisionTypes.some((name) => isMedicalDirectorType({ name })),
    superviseeOccupation: profile.superviseeOccupation ?? '',
    superviseeSpecialty: profile.superviseeSpecialty ?? '',
    howSoonLooking: profile.howSoonLooking ?? '',
    lookingDate: profile.lookingDate ? profile.lookingDate.slice(0, 10) : '',
    preferredFormat: profile.preferredFormat ?? '',
    availability: profile.availability ?? '',
    idealSupervisor: profile.idealSupervisor ?? '',
    budgetRangeType: profile.budgetRangeType ?? '',
    budgetRangeStart: profile.budgetRangeStart ?? undefined,
    budgetRangeEnd: profile.budgetRangeEnd ?? undefined,
    uploadProfilePhoto: undefined,
  }
}

export function superviseeProfileFormValuesToPayload(
  values: EditSuperviseeProfileFormValues,
): UpdateSuperviseeProfilePayload {
  // The selected supervision type plus Medical Director when its checkbox is ticked
  // (the checkbox can also stand alone) — mirrors buildSuperviseeFormData in signup.
  const supervisionTypes = [
    ...new Set(
      [
        values.typeOfSupervisorNeeded,
        values.needsMedicalDirector ? MEDICAL_DIRECTOR_TYPE_NAME : '',
      ].filter(Boolean),
    ),
  ]

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
    title: values.title.trim() || undefined,
    licensureState: values.licensureState || undefined,
    stateOfLicensure: values.stateOfLicensure,
    typeOfSupervisorNeeded: supervisionTypes.length > 0 ? supervisionTypes : undefined,
    // '' (not undefined) when cleared, so the backend nulls the stored value — e.g. a
    // Medical Director-only request must not keep the previous type's occupation/specialty
    superviseeOccupation: values.superviseeOccupation,
    superviseeSpecialty: values.superviseeSpecialty ?? '',
    howSoonLooking: values.howSoonLooking || undefined,
    lookingDate:
      values.howSoonLooking === 'CUSTOM_DATE' ? values.lookingDate || undefined : undefined,
    preferredFormat: values.preferredFormat || undefined,
    availability: values.availability || undefined,
    idealSupervisor: values.idealSupervisor || undefined,
    budgetRangeType: values.budgetRangeType || undefined,
    // Monthly budgets are a single amount stored in `budgetRangeEnd`; `start` is 0
    budgetRangeStart: values.budgetRangeType === 'MONTHLY' ? 0 : values.budgetRangeStart,
    budgetRangeEnd: values.budgetRangeEnd,
    uploadProfilePhoto:
      values.uploadProfilePhoto instanceof File ? values.uploadProfilePhoto : undefined,
  }
}
