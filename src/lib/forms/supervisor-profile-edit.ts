import { z } from 'zod'

import {
  applyMedicalDirectorBoardCertRules,
  applyMedicalDirectorOfferingRules,
  boardCertificationEntrySchema,
  type BoardCertificationEntryValues,
  licenseEntrySchema,
  type LicenseEntryValues,
  OFFERING_SUPERVISOR_TYPE_NAMES,
  offeringCredentialsSchema,
  type OfferingCredentialsValues,
  professionalCredentialsSchema,
  yearsOfExperienceOptions,
} from '@/components/Signup/schema'
import { buildBoardCertificationsPayload, buildOfferingsPayload } from '@/lib/api/signup'
import type { UpdateSupervisorProfilePayload } from '@/lib/api/supervisor-profile'
import {
  ABMS_CERTIFYING_BOARDS,
  OTHER_CERTIFYING_BOARD_VALUE,
} from '@/lib/utils/board-certification'
import { normalizeNumberFieldInput } from '@/lib/utils/number-input'
import { formatUSPhoneForDisplay, normalizeUSPhoneNumber } from '@/lib/utils/phone'
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'
import {
  isMonthlyOnlySupervisorType,
  isPhysicianSupervisorType,
  isValidPhysicianDegreeType,
  MONTHLY_ONLY_FEE_TYPE_MESSAGE,
} from '@/lib/utils/supervisor-type'
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

/**
 * Field rules aligned with {@link supervisorSchema} / supervisor signup (excluding account
 * creation-only fields: email, password, agreements, new license file upload).
 */
const editSupervisorProfileFieldsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  professionalCredentials: professionalCredentialsSchema,
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
  supervisorType: z
    .string()
    .min(1, 'Supervisor type is required')
    .refine((s) => !isEmptySelect(s), { message: 'Supervisor type is required' }),
  supervisorOccupation: z
    .string()
    .min(1, 'Occupation is required')
    .refine((s) => !isEmptySelect(s), { message: 'Occupation is required' }),
  supervisorSpecialty: z.string().optional(),
  degreeType: z.string(),
  licenses: z.array(licenseEntrySchema).min(1, 'Add at least one license'),
  yearsOfExperience: z
    .string()
    .min(1, 'Years of experience is required')
    .refine((v) => (yearsOfExperienceOptions as readonly string[]).includes(v), {
      message: 'Please select years of experience',
    }),
  npiNumber: z.string().max(20).optional(),
  certification: z.array(z.string()),
  // Required unless a plain Medical Director (no physician offerings) — see
  // the superRefine in createEditSupervisorProfileSchema.
  patientPopulation: z.array(z.string()),
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

  // Medical Director only — same field names/shapes as the MD signup so the
  // shared components (OfferingCredentialsFields, BoardCertificationEntriesField)
  // and conditional rules work unchanged. Blank/false for other supervisors.
  offerSupervisingPhysician: z.boolean(),
  offerCollaboratingPhysician: z.boolean(),
  offerings: z.object({
    supervising: offeringCredentialsSchema,
    collaborating: offeringCredentialsSchema,
  }),
  boardCertified: z.boolean(),
  boardCertifications: z.array(boardCertificationEntrySchema),
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

    const physician = isPhysicianSupervisorType(data.supervisorType)
    if (physician) {
      if (!data.degreeType?.trim() || isEmptySelect(data.degreeType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['degreeType'],
          message: 'Degree type is required',
        })
      } else if (!isValidPhysicianDegreeType(data.degreeType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['degreeType'],
          message: 'Degree type must be MD or DO',
        })
      }
    } else {
      data.licenses.forEach((license, index) => {
        if (!license.licenseType?.trim() || isEmptySelect(license.licenseType)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['licenses', index, 'licenseType'],
            message: 'License type is required',
          })
        }
      })
    }

    if (!physician && data.certification.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['certification'],
        message: 'Add at least one certification',
      })
    }

    if (isMonthlyOnlySupervisorType(data.supervisorType) && data.supervisionFeeType !== 'MONTHLY') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supervisionFeeType'],
        message: MONTHLY_ONLY_FEE_TYPE_MESSAGE,
      })
    }

    // Self-gating on the checked/Yes flags — no-ops for non-Medical-Director
    // profiles whose flags stay false.
    applyMedicalDirectorOfferingRules(data, ctx)
    applyMedicalDirectorBoardCertRules(data, ctx)

    // Patient population is a clinical-supervision field: plain Medical
    // Directors (no physician offerings) skip it, everyone else requires it.
    const plainMedicalDirector =
      data.supervisorType === MEDICAL_DIRECTOR_TYPE_NAME &&
      !data.offerSupervisingPhysician &&
      !data.offerCollaboratingPhysician
    if (!plainMedicalDirector && data.patientPopulation.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientPopulation'],
        message: 'Add at least one patient population',
      })
    }
  })
}

/**
 * Form values as they exist in the edit form (before schema validation) —
 * `supervisionFeeAmount` is `undefined` when the profile has no fee yet, so the
 * field starts empty instead of an invalid 0.
 */
export type SupervisorProfileFormInput = Omit<
  EditSupervisorProfileFormValues,
  'supervisionFeeAmount'
> & {
  supervisionFeeAmount?: number
}

/**
 * Prefilled license entries plus per-entry "please confirm" flags, aligned by
 * index. Entries come from the profile's license rows; legacy records fall
 * back to the flat mirror columns, and each licensed state without a license
 * row pre-appends a mostly-blank entry so supervisors confirm or correct each
 * state's details instead of silently losing states on save.
 */
export function getSupervisorLicenseEntryDefaults(profile: SupervisorProfileData): {
  entries: LicenseEntryValues[]
  entriesNeedingReview: boolean[]
} {
  const physician = isPhysicianSupervisorType(profile.supervisorType ?? '')
  const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : '')

  const rows = profile.licenses ?? []
  const entries: LicenseEntryValues[] = rows.map((row) => ({
    licenseType: physician ? '' : (row.licenseType ?? ''),
    licenseNumber: row.licenseNumber ?? '',
    state: row.state ?? '',
    licenseExpiration: toDateInput(row.licenseExpiration),
  }))
  const entriesNeedingReview = rows.map(
    (row) => Boolean(row.needsReview) || !row.state?.trim() || !row.licenseNumber?.trim(),
  )

  // Unmigrated legacy record: synthesize one entry from the flat mirror columns.
  if (entries.length === 0) {
    entries.push({
      licenseType: physician ? '' : (profile.licenseType ?? ''),
      licenseNumber: profile.licenseNumber ?? '',
      state: profile.stateLicense ?? '',
      licenseExpiration: toDateInput(profile.licenseExpiration),
    })
    entriesNeedingReview.push(!profile.stateLicense?.trim() || !profile.licenseNumber?.trim())
  }

  const coveredStates = new Set(entries.map((entry) => entry.state).filter(Boolean))
  for (const state of profile.user.stateOfLicensure ?? []) {
    if (!state || coveredStates.has(state)) continue
    coveredStates.add(state)
    entries.push({ licenseType: '', licenseNumber: '', state, licenseExpiration: '' })
    entriesNeedingReview.push(true)
  }

  return { entries, entriesNeedingReview }
}

const emptyOfferingBlock = (): OfferingCredentialsValues => ({
  occupation: '',
  specialty: '',
  degreeType: '',
  licenses: [{ licenseType: '', licenseNumber: '', state: '', licenseExpiration: '' }],
})

const OFFERING_KEY_BY_TYPE_NAME: Record<string, 'supervising' | 'collaborating'> = {
  [OFFERING_SUPERVISOR_TYPE_NAMES.supervising]: 'supervising',
  [OFFERING_SUPERVISOR_TYPE_NAMES.collaborating]: 'collaborating',
}

/** Stored offering rows → checkbox flags + keyed credential blocks. */
export function getSupervisorOfferingDefaults(profile: SupervisorProfileData): {
  offerSupervisingPhysician: boolean
  offerCollaboratingPhysician: boolean
  offerings: { supervising: OfferingCredentialsValues; collaborating: OfferingCredentialsValues }
} {
  const blocks = {
    supervising: emptyOfferingBlock(),
    collaborating: emptyOfferingBlock(),
  }
  const flags = { supervising: false, collaborating: false }
  const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : '')

  for (const offering of profile.offerings ?? []) {
    const key = OFFERING_KEY_BY_TYPE_NAME[offering.supervisorType]
    if (!key) continue
    flags[key] = true
    blocks[key] = {
      occupation: offering.occupation ?? '',
      specialty: offering.specialty ?? '',
      degreeType: offering.degreeType ?? '',
      licenses: (offering.licenses ?? []).map((license) => ({
        licenseType: '',
        licenseNumber: license.licenseNumber ?? '',
        state: license.state ?? '',
        licenseExpiration: toDateInput(license.licenseExpiration),
      })),
    }
    if (blocks[key].licenses.length === 0) {
      blocks[key].licenses = emptyOfferingBlock().licenses
    }
  }

  return {
    offerSupervisingPhysician: flags.supervising,
    offerCollaboratingPhysician: flags.collaborating,
    offerings: blocks,
  }
}

/** Stored board-certification rows → Yes/No flag + entries ("Other" detected against the ABMS list). */
export function getSupervisorBoardCertificationDefaults(profile: SupervisorProfileData): {
  boardCertified: boolean
  boardCertifications: BoardCertificationEntryValues[]
} {
  const toDateInput = (value: string | null | undefined) => (value ? value.slice(0, 10) : '')
  const rows = profile.boardCertifications ?? []

  const entries: BoardCertificationEntryValues[] = rows.map((row) => {
    const isKnownBoard = (ABMS_CERTIFYING_BOARDS as readonly string[]).includes(row.certifyingBoard)
    return {
      certifyingBoard: isKnownBoard ? row.certifyingBoard : OTHER_CERTIFYING_BOARD_VALUE,
      certifyingBoardOther: isKnownBoard ? '' : row.certifyingBoard,
      specialty: row.specialty ?? '',
      subspecialty: row.subspecialty ?? '',
      certificationNumber: row.certificationNumber ?? '',
      expirationDate: toDateInput(row.expirationDate),
    }
  })

  return {
    boardCertified: entries.length > 0,
    boardCertifications:
      entries.length > 0
        ? entries
        : [
            {
              certifyingBoard: '',
              certifyingBoardOther: '',
              specialty: '',
              subspecialty: '',
              certificationNumber: '',
              expirationDate: '',
            },
          ],
  }
}

export function getDefaultSupervisorProfileFormValues(
  profile: SupervisorProfileData,
): SupervisorProfileFormInput {
  const physician = isPhysicianSupervisorType(profile.supervisorType ?? '')

  return {
    fullName: profile.user.fullName ?? '',
    professionalCredentials: profile.professionalCredentials ?? '',
    contactNumber: formatUSPhoneForDisplay(profile.user.contactNumber ?? ''),
    city: profile.user.city ?? '',
    state: profile.user.state ?? '',
    zipcode: profile.user.zipcode ?? '',
    website: profile.website ?? '',
    supervisorType: profile.supervisorType ?? '',
    supervisorOccupation: profile.supervisorOccupation ?? '',
    supervisorSpecialty: profile.supervisorSpecialty ?? '',
    degreeType: physician ? (profile.degreeType ?? profile.licenseType ?? '') : '',
    licenses: getSupervisorLicenseEntryDefaults(profile).entries,
    yearsOfExperience: (() => {
      const raw = profile.yearsOfExperience?.trim() ?? ''
      return (yearsOfExperienceOptions as readonly string[]).includes(raw) ? raw : ''
    })(),
    npiNumber: profile.npiNumber ?? '',
    certification: physician ? [] : (profile.certification ?? []),
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
    supervisionFeeAmount: profile.supervisionFeeAmount ?? undefined,
    uploadProfilePhoto: undefined,
    ...getSupervisorOfferingDefaults(profile),
    ...getSupervisorBoardCertificationDefaults(profile),
  }
}

// Accepts the pre-validation form shape — an absent fee is simply omitted from the
// payload, so defaults can round-trip through here (e.g. in tests) without a cast.
export function supervisorProfileFormValuesToPayload(
  values: SupervisorProfileFormInput,
): UpdateSupervisorProfilePayload {
  return {
    fullName: values.fullName,
    // Always sent (empty string clears the stored value on the backend).
    professionalCredentials: values.professionalCredentials?.trim() ?? '',
    contactNumber: values.contactNumber
      ? (normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
      : undefined,
    city: values.city,
    state: values.state,
    zipcode: values.zipcode || undefined,
    website: values.website || undefined,
    supervisorType: values.supervisorType || undefined,
    occupation: values.supervisorOccupation || undefined,
    specialty: values.supervisorSpecialty || undefined,
    ...(isPhysicianSupervisorType(values.supervisorType)
      ? { degreeType: values.degreeType || undefined }
      : {}),
    licenses: values.licenses.map(({ licenseType, licenseNumber, state, licenseExpiration }) => ({
      ...(isPhysicianSupervisorType(values.supervisorType) ? {} : { licenseType }),
      licenseNumber,
      state,
      licenseExpiration,
    })),
    yearsOfExperience: values.yearsOfExperience || undefined,
    npiNumber: values.npiNumber || undefined,
    certification: isPhysicianSupervisorType(values.supervisorType) ? [] : values.certification,
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
    // Medical Director only: full replace — unchecked boxes / "No" send empty
    // arrays so removed offerings/certifications are cleared server-side.
    ...(values.supervisorType === MEDICAL_DIRECTOR_TYPE_NAME
      ? {
          offerings: buildOfferingsPayload(values),
          boardCertifications: buildBoardCertificationsPayload(values),
        }
      : {}),
  }
}
