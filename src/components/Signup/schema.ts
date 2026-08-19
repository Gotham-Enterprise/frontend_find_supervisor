import { z } from 'zod'

import { OTHER_CERTIFYING_BOARD_VALUE } from '@/lib/utils/board-certification'
import { todayLocalISO } from '@/lib/utils/date'
import { normalizeNumberFieldInput } from '@/lib/utils/number-input'
import { SUPERVISION_TYPE_REQUIRED_MESSAGE } from '@/lib/utils/supervisee-eligibility'
import {
  applySupervisorMonthlyOnlyFeeRule,
  applySupervisorPhysicianRules,
  isValidPhysicianDegreeType,
} from '@/lib/utils/supervisor-type'

// ─── Shared options ──────────────────────────────────────────────────────────

export const MAX_LICENSE_DOC_SIZE_BYTES = 5 * 1024 * 1024
export const MAX_LICENSE_DOC_SIZE_LABEL = '5 MB'

export const PROFESSIONAL_CREDENTIALS_MAX_LENGTH = 150
/** Letters, numbers, spaces, commas, periods, parentheses, and hyphens — e.g. "Ph.D., NCC, LPC-S (AL)". */
export const PROFESSIONAL_CREDENTIALS_PATTERN = /^[A-Za-z0-9 .,()-]*$/
export const PROFESSIONAL_CREDENTIALS_HELPER_TEXT =
  'Enter degrees, licenses, and certifications that appear after your name. Example: Ph.D., NCC, LPC-S (AL), LPC (MI)'

/** Optional post-nominal letters shown after the supervisor's full name. */
export const professionalCredentialsSchema = z
  .string()
  .max(
    PROFESSIONAL_CREDENTIALS_MAX_LENGTH,
    `Professional credentials must be ${PROFESSIONAL_CREDENTIALS_MAX_LENGTH} characters or less`,
  )
  .regex(
    PROFESSIONAL_CREDENTIALS_PATTERN,
    'Only letters, numbers, spaces, commas, periods, parentheses, and hyphens are allowed',
  )
  .optional()

export const yearsOfExperienceOptions = [
  '0 – 2 years',
  '2 – 5 years',
  '5 – 10 years',
  '10 – 15 years',
  '15+ years',
] as const

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

/** Shared account fields (supervisor + supervisee signup). `confirmPassword` is UI-only — strip before API. */
export const accountSchemaBase = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirmPassword: z.string().min(1, 'Please confirm your password').max(128),
  contactNumber: z.string().min(1, 'Contact number is required'),
  // .refine(isValidUSPhoneNumber, 'Please enter a valid US phone number.'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required'),
  zipcode: z
    .string()
    .min(5, 'Zipcode must be at least 5 digits')
    .max(10)
    .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid US zipcode'),
})

function withPasswordConfirmation<S extends z.ZodObject<z.ZodRawShape>>(schema: S) {
  return schema.refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
}

export const supervisionFeeTypeOptions = [
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'MONTHLY', label: 'Monthly' },
] as const

// ─── License entries ──────────────────────────────────────────────────────────

/**
 * One license per entry, each tied to its own state. `licenseType` is
 * required for non-physicians only (enforced by `applySupervisorPhysicianRules`);
 * physicians use the shared top-level `degreeType` instead.
 */
export const licenseEntrySchema = z.object({
  licenseType: z.string(),
  licenseNumber: z.string().min(1, 'License number is required').max(50),
  state: z.string().min(1, 'State is required'),
  licenseExpiration: z
    .string()
    .min(1, 'Expiration date is required')
    // String comparison on YYYY-MM-DD — parsing with `new Date(val)` reads UTC midnight
    // and rejected today's date in timezones behind UTC.
    .refine((val) => val >= todayLocalISO(), {
      message: 'License expiration cannot be a past date',
    }),
})

export type LicenseEntryValues = z.infer<typeof licenseEntrySchema>

// ─── Medical Director offerings ───────────────────────────────────────────────

export type OfferingKey = 'supervising' | 'collaborating'

/** Form key → supervisorType name sent in the `offerings` payload. */
export const OFFERING_SUPERVISOR_TYPE_NAMES: Record<OfferingKey, string> = {
  supervising: 'Supervising Physician',
  collaborating: 'Collaborating Physician',
}

/**
 * Lenient by design — required-ness is enforced by
 * `applyMedicalDirectorOfferingRules` only when the offering's checkbox is
 * checked (unchecked blocks hold blank defaults). Offering types are
 * physician types, so entries carry no licenseType (the `licenseType` key is
 * kept for the shared LicenseEntriesField shape and stripped from the payload).
 */
export const offeringCredentialsSchema = z.object({
  occupation: z.string(),
  specialty: z.string().optional(),
  degreeType: z.string(),
  licenses: z.array(
    z.object({
      licenseType: z.string(),
      licenseNumber: z.string(),
      state: z.string(),
      licenseExpiration: z.string(),
    }),
  ),
})

export type OfferingCredentialsValues = z.infer<typeof offeringCredentialsSchema>

// ─── Medical Director board certifications ────────────────────────────────────

/**
 * Lenient by design — required-ness is enforced by
 * `applyMedicalDirectorBoardCertRules` only when "Board Certified?" is Yes.
 * `certifyingBoardOther` holds the free-text board name when the select is
 * "Other" (UI-only split; the payload sends a single certifyingBoard string).
 */
export const boardCertificationEntrySchema = z.object({
  certifyingBoard: z.string(),
  certifyingBoardOther: z.string(),
  specialty: z.string(),
  subspecialty: z.string(),
  certificationNumber: z.string().max(50, 'Certification number must be 50 characters or less'),
  expirationDate: z.string(),
})

export type BoardCertificationEntryValues = z.infer<typeof boardCertificationEntrySchema>

// ─── Supervisor schema ─────────────────────────────────────────────────────────

export const supervisorSchemaObject = accountSchemaBase.extend({
  // Step 1 — post-nominal letters displayed after the full name
  professionalCredentials: professionalCredentialsSchema,

  // Step 2 — supervisor-type hierarchy cascade (stored as plain strings on SupervisorProfile)
  supervisorType: z.string().min(1, 'Supervisor type is required'),
  supervisorOccupationId: z.string().min(1, 'Occupation is required'),
  supervisorSpecialtyId: z.string().optional(),

  // License & credentials — one entry per license, each with its own state
  degreeType: z.string(),
  licenses: z.array(licenseEntrySchema).min(1, 'Add at least one license'),
  npiNumber: z.string().max(20).optional(),
  certifications: z.array(z.string()),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  licenseDoc: z
    .any()
    .refine((val) => val instanceof File, 'Please upload your license or verification doc')
    .refine(
      (val) => !(val instanceof File) || val.size <= MAX_LICENSE_DOC_SIZE_BYTES,
      `File is too large. Please upload a file under ${MAX_LICENSE_DOC_SIZE_LABEL}.`,
    ),

  // Practice details
  patientPopulation: z.array(z.string()).min(1, 'Add at least one patient population'),
  supervisionFormat: z.enum(['virtual', 'in-person', 'hybrid'], {
    message: 'Please select a supervision format',
  }),
  availability: z.string().min(1, 'Availability is required'),
  acceptingNewSupervisees: z.boolean(),
  professionalSummary: z
    .string()
    .min(20, 'Professional summary must be at least 20 characters')
    .max(500, 'Professional summary must be 500 characters or less'),
  describeYourself: z
    .string()
    .min(20, 'Describe yourself must be at least 20 characters')
    .max(500, 'Describe yourself must be 500 characters or less'),

  // Fee
  supervisionFeeType: z.enum(['HOURLY', 'MONTHLY'], {
    message: 'Please select a fee type',
  }),
  supervisionFeeAmount: z.preprocess(
    normalizeNumberFieldInput,
    z.number('Please enter a fee amount').min(1, 'Fee amount must be at least $1'),
  ),

  // Profile photo
  uploadProfilePhoto: z.any().refine((val) => val instanceof File, 'Please upload a profile photo'),

  // Optional
  website: z
    .string()
    .max(200)
    .optional()
    .refine((v) => !v || v.length === 0 || /^https?:\/\/\S+/.test(v), {
      message: 'Please enter a valid URL (e.g. https://example.com)',
    }),

  agreedToPost: z.boolean().refine((val) => val === true, 'You must agree to post your profile'),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
})

export const supervisorSchema = withPasswordConfirmation(
  supervisorSchemaObject
    .superRefine(applySupervisorPhysicianRules)
    .superRefine(applySupervisorMonthlyOnlyFeeRule),
)

// ─── Medical Director schema ──────────────────────────────────────────────────

/**
 * The Medical Director signup reuses the supervisor form with a preset
 * `supervisorType` plus optional secondary offerings (Supervising/Collaborating
 * Physician), each carrying its own credentials block.
 */
export const medicalDirectorSchemaObject = supervisorSchemaObject.extend({
  // Patient population only applies when the MD also offers clinical
  // supervision — required-ness lives in applyMedicalDirectorPracticeRules.
  patientPopulation: z.array(z.string()),
  offerSupervisingPhysician: z.boolean(),
  offerCollaboratingPhysician: z.boolean(),
  offerings: z.object({
    supervising: offeringCredentialsSchema,
    collaborating: offeringCredentialsSchema,
  }),
  // "Board Certified?" Yes/No; entries validated only when Yes
  boardCertified: z.boolean(),
  boardCertifications: z.array(boardCertificationEntrySchema),
})

export type MedicalDirectorFormValues = z.infer<typeof medicalDirectorSchemaObject>

/**
 * Each CHECKED offering requires occupation, a valid MD/DO degree type, and at
 * least one complete license entry. Unchecked offerings are ignored entirely
 * (their blank blocks stay in form state via `shouldUnregister: false`).
 */
export function applyMedicalDirectorOfferingRules(
  data: Pick<
    MedicalDirectorFormValues,
    'offerSupervisingPhysician' | 'offerCollaboratingPhysician' | 'offerings'
  >,
  ctx: z.RefinementCtx,
) {
  const checkedKeys: OfferingKey[] = []
  if (data.offerSupervisingPhysician) checkedKeys.push('supervising')
  if (data.offerCollaboratingPhysician) checkedKeys.push('collaborating')

  for (const key of checkedKeys) {
    const block = data.offerings[key]

    if (!block.occupation.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['offerings', key, 'occupation'],
        message: 'Occupation is required',
      })
    }

    if (!block.degreeType.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['offerings', key, 'degreeType'],
        message: 'Degree type is required',
      })
    } else if (!isValidPhysicianDegreeType(block.degreeType)) {
      ctx.addIssue({
        code: 'custom',
        path: ['offerings', key, 'degreeType'],
        message: 'Degree type must be MD or DO',
      })
    }

    if (block.licenses.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['offerings', key, 'licenses'],
        message: 'Add at least one license',
      })
    }

    // Reuse licenseEntrySchema's per-field checks (identical messages, incl.
    // the timezone-safe past-date rule). licenseType is skipped — offering
    // types are physician types.
    block.licenses.forEach((license, index) => {
      for (const field of ['licenseNumber', 'state', 'licenseExpiration'] as const) {
        const result = licenseEntrySchema.shape[field].safeParse(license[field])
        if (!result.success) {
          ctx.addIssue({
            code: 'custom',
            path: ['offerings', key, 'licenses', index, field],
            message: result.error.issues[0]?.message ?? 'Invalid',
          })
        }
      }
    })
  }
}

/**
 * When "Board Certified?" is Yes: at least one entry; per entry the certifying
 * board (free text when "Other") and specialty are required; expiration, when
 * provided, cannot be a past date (a lapsed cert is not a current one).
 * When No, entries are ignored entirely (blank state persists via
 * `shouldUnregister: false`).
 */
export function applyMedicalDirectorBoardCertRules(
  data: Pick<MedicalDirectorFormValues, 'boardCertified' | 'boardCertifications'>,
  ctx: z.RefinementCtx,
) {
  if (!data.boardCertified) return

  if (data.boardCertifications.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['boardCertifications'],
      message: 'Add at least one board certification',
    })
  }

  data.boardCertifications.forEach((entry, index) => {
    if (!entry.certifyingBoard.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['boardCertifications', index, 'certifyingBoard'],
        message: 'Certifying board is required',
      })
    } else if (
      entry.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE &&
      !entry.certifyingBoardOther.trim()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['boardCertifications', index, 'certifyingBoardOther'],
        message: 'Please enter the certifying board name',
      })
    }

    if (!entry.specialty.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['boardCertifications', index, 'specialty'],
        message: 'Specialty is required',
      })
    }

    if (entry.expirationDate && entry.expirationDate < todayLocalISO()) {
      ctx.addIssue({
        code: 'custom',
        path: ['boardCertifications', index, 'expirationDate'],
        message: 'Expiration cannot be a past date',
      })
    }
  })
}

/**
 * Patient population is a clinical-supervision concern: required only when at
 * least one physician offering is checked; a plain Medical Director skips it.
 */
export function applyMedicalDirectorPracticeRules(
  data: Pick<
    MedicalDirectorFormValues,
    'offerSupervisingPhysician' | 'offerCollaboratingPhysician' | 'patientPopulation'
  >,
  ctx: z.RefinementCtx,
) {
  const offersSupervision = data.offerSupervisingPhysician || data.offerCollaboratingPhysician
  if (offersSupervision && data.patientPopulation.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['patientPopulation'],
      message: 'Add at least one patient population',
    })
  }
}

export const medicalDirectorSchema = withPasswordConfirmation(
  medicalDirectorSchemaObject
    .superRefine(applySupervisorPhysicianRules)
    .superRefine(applySupervisorMonthlyOnlyFeeRule)
    .superRefine(applyMedicalDirectorOfferingRules)
    .superRefine(applyMedicalDirectorBoardCertRules)
    .superRefine(applyMedicalDirectorPracticeRules),
)

// ─── Supervisee schema ─────────────────────────────────────────────────────────

export const superviseeSchemaObject = accountSchemaBase.extend({
  // Step 2 — supervision needs. Eligibility for `typeOfSupervisor` is derived from the
  // profile fields below (title + occupationId); see lib/utils/supervisee-eligibility.ts.
  // Required unless `needsMedicalDirector` is checked — enforced by
  // `applySuperviseeSupervisionNeedRules`, not here.
  typeOfSupervisor: z.string(),
  // Medical Director is requested via a checkbox rather than the dropdown, since it can
  // be combined with any supervision type or requested on its own.
  needsMedicalDirector: z.boolean().default(false),
  // Desired supervisor's occupation/specialty within the selected type (sent to the
  // backend as plain strings: superviseeOccupation / superviseeSpecialty).
  // Occupation is required only when a supervision type is selected (see the refine below).
  supervisorOccupationId: z.string(),
  supervisorSpecialtyId: z.string().optional(),

  stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
  howSoon: z.string().min(1, 'Please select how soon you need a supervisor'),
  howSoonDate: z.string().optional(),
  preferredFormat: z.enum(['virtual', 'in-person', 'hybrid'], {
    message: 'Please select a preferred format',
  }),
  feeType: z.enum(['hourly', 'monthly'], { message: 'Please select a fee type' }),
  // Hourly uses the range dropdown; Monthly is a single typed amount — each is
  // required only for its fee type (see applySuperviseeBudgetRules).
  budgetRange: z.string(),
  monthlyBudget: z.preprocess(
    normalizeNumberFieldInput,
    z
      .number('Please enter your monthly budget')
      .min(1, 'Monthly budget must be at least $1')
      .optional(),
  ),
  availability: z.string().min(1, 'Availability is required'),

  // Step 2 — profile fields (sent to backend as numeric category IDs); collected before
  // `typeOfSupervisor` so the available supervision types can be filtered by eligibility
  title: z.string().min(1, 'Credential or license type is required').max(100),
  // State tied to the credential (stored as the US state abbreviation, e.g. "TX")
  licensureState: z.string().min(1, 'State of licensure is required'),
  occupationId: z.string().min(1, 'Occupation is required'),
  specialtyId: z.string().optional(),

  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Must be 500 characters or less'),

  // Profile photo
  uploadProfilePhoto: z.any().refine((val) => val instanceof File, 'Please upload a profile photo'),

  agreedToPost: z.boolean().refine((val) => val === true, 'You must agree to post your profile'),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
})

/**
 * A supervision type is required unless the supervisee only needs a Medical Director;
 * the desired supervisor's occupation cascades from the type, so it is required only
 * when a type is selected.
 */
function applySuperviseeSupervisionNeedRules(
  data: { typeOfSupervisor: string; needsMedicalDirector: boolean; supervisorOccupationId: string },
  ctx: z.RefinementCtx,
) {
  if (!data.typeOfSupervisor && !data.needsMedicalDirector) {
    ctx.addIssue({
      code: 'custom',
      path: ['typeOfSupervisor'],
      message: SUPERVISION_TYPE_REQUIRED_MESSAGE,
    })
  }
  if (data.typeOfSupervisor && !data.supervisorOccupationId) {
    ctx.addIssue({
      code: 'custom',
      path: ['supervisorOccupationId'],
      message: 'Occupation is required',
    })
  }
}

/** Hourly budgets pick a range; Monthly budgets type a single amount. */
function applySuperviseeBudgetRules(
  data: { feeType: string; budgetRange: string; monthlyBudget?: number },
  ctx: z.RefinementCtx,
) {
  if (data.feeType === 'hourly' && !data.budgetRange) {
    ctx.addIssue({
      code: 'custom',
      path: ['budgetRange'],
      message: 'Please select a budget range',
    })
  }
  if (data.feeType === 'monthly' && data.monthlyBudget == null) {
    ctx.addIssue({
      code: 'custom',
      path: ['monthlyBudget'],
      message: 'Please enter your monthly budget',
    })
  }
}

export const superviseeSchema = withPasswordConfirmation(
  superviseeSchemaObject
    .superRefine(applySuperviseeSupervisionNeedRules)
    .superRefine(applySuperviseeBudgetRules),
)

export type SupervisorFormValues = z.infer<typeof supervisorSchemaObject>
export type SuperviseeFormValues = z.infer<typeof superviseeSchemaObject>

// ─── Supervisor multi-step (same rules as supervisorSchema, split by step) ───

export const supervisorStep1Schema = withPasswordConfirmation(
  supervisorSchemaObject.pick({
    uploadProfilePhoto: true,
    fullName: true,
    professionalCredentials: true,
    email: true,
    password: true,
    confirmPassword: true,
    contactNumber: true,
    city: true,
    state: true,
    zipcode: true,
    website: true,
  }),
)

export const supervisorStep2Schema = supervisorSchemaObject
  .pick({
    supervisorType: true,
    supervisorOccupationId: true,
    supervisorSpecialtyId: true,
    degreeType: true,
    licenses: true,
    npiNumber: true,
    certifications: true,
    yearsOfExperience: true,
    licenseDoc: true,
  })
  .superRefine(applySupervisorPhysicianRules)

export const supervisorStep3Schema = supervisorSchemaObject
  .pick({
    // Validated on step 2 — included here so the monthly-only fee rule can see it
    supervisorType: true,
    patientPopulation: true,
    supervisionFormat: true,
    availability: true,
    acceptingNewSupervisees: true,
    supervisionFeeType: true,
    supervisionFeeAmount: true,
    professionalSummary: true,
    describeYourself: true,
    agreedToPost: true,
    agreedToTerms: true,
  })
  .superRefine(applySupervisorMonthlyOnlyFeeRule)

export const SUPERVISOR_SIGNUP_STEP_SCHEMAS = [
  supervisorStep1Schema,
  supervisorStep2Schema,
  supervisorStep3Schema,
] as const

/** Field names validated on each step (for clearing errors before re-validation). */
export const SUPERVISOR_SIGNUP_STEP_FIELDS = [
  [
    'uploadProfilePhoto',
    'fullName',
    'professionalCredentials',
    'email',
    'password',
    'confirmPassword',
    'contactNumber',
    'city',
    'state',
    'zipcode',
    'website',
  ],
  [
    'supervisorType',
    'supervisorOccupationId',
    'supervisorSpecialtyId',
    'degreeType',
    'licenses',
    'npiNumber',
    'certifications',
    'yearsOfExperience',
    'licenseDoc',
  ],
  [
    'patientPopulation',
    'supervisionFormat',
    'availability',
    'acceptingNewSupervisees',
    'supervisionFeeType',
    'supervisionFeeAmount',
    'professionalSummary',
    'describeYourself',
    'agreedToPost',
    'agreedToTerms',
  ],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof SupervisorFormValues>>

export const SUPERVISOR_SIGNUP_STEP_META = [
  { title: 'Account', stepLabel: 'Step 1' },
  { title: 'License & Credentials', stepLabel: 'Step 2' },
  { title: 'Practice Details', stepLabel: 'Step 3' },
] as const

// ─── Medical Director multi-step (supervisor steps with an offerings-aware step 2) ─

export const medicalDirectorStep2Schema = medicalDirectorSchemaObject
  .pick({
    supervisorType: true,
    supervisorOccupationId: true,
    supervisorSpecialtyId: true,
    degreeType: true,
    licenses: true,
    npiNumber: true,
    certifications: true,
    yearsOfExperience: true,
    licenseDoc: true,
    offerSupervisingPhysician: true,
    offerCollaboratingPhysician: true,
    offerings: true,
    boardCertified: true,
    boardCertifications: true,
  })
  .superRefine(applySupervisorPhysicianRules)
  .superRefine(applyMedicalDirectorOfferingRules)
  .superRefine(applyMedicalDirectorBoardCertRules)

export const medicalDirectorStep3Schema = medicalDirectorSchemaObject
  .pick({
    // Validated on step 2 — included so the conditional rules can see them
    supervisorType: true,
    offerSupervisingPhysician: true,
    offerCollaboratingPhysician: true,
    patientPopulation: true,
    supervisionFormat: true,
    availability: true,
    acceptingNewSupervisees: true,
    supervisionFeeType: true,
    supervisionFeeAmount: true,
    professionalSummary: true,
    describeYourself: true,
    agreedToPost: true,
    agreedToTerms: true,
  })
  .superRefine(applySupervisorMonthlyOnlyFeeRule)
  .superRefine(applyMedicalDirectorPracticeRules)

export const MEDICAL_DIRECTOR_SIGNUP_STEP_SCHEMAS = [
  supervisorStep1Schema,
  medicalDirectorStep2Schema,
  medicalDirectorStep3Schema,
] as const

/**
 * Step field lists mirror the supervisor's; step 2 adds the offering flags and
 * blocks. Nested error paths (`offerings.supervising.licenses.0.state`) route
 * to step 2 via their root segment (`findFirstStepWithError`).
 */
export const MEDICAL_DIRECTOR_SIGNUP_STEP_FIELDS = [
  SUPERVISOR_SIGNUP_STEP_FIELDS[0],
  [
    ...SUPERVISOR_SIGNUP_STEP_FIELDS[1],
    'offerSupervisingPhysician',
    'offerCollaboratingPhysician',
    'offerings',
    'boardCertified',
    'boardCertifications',
  ],
  SUPERVISOR_SIGNUP_STEP_FIELDS[2],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof MedicalDirectorFormValues>>

// ─── Supervisee multi-step (same rules as superviseeSchema, split by step) ─────

export const superviseeStep1Schema = withPasswordConfirmation(
  superviseeSchemaObject.pick({
    uploadProfilePhoto: true,
    fullName: true,
    email: true,
    password: true,
    confirmPassword: true,
    contactNumber: true,
    city: true,
    state: true,
    zipcode: true,
  }),
)

export const superviseeStep2Schema = superviseeSchemaObject
  .pick({
    occupationId: true,
    specialtyId: true,
    title: true,
    licensureState: true,
    typeOfSupervisor: true,
    needsMedicalDirector: true,
    supervisorOccupationId: true,
    supervisorSpecialtyId: true,
    stateOfLicensure: true,
    howSoon: true,
    howSoonDate: true,
    preferredFormat: true,
    feeType: true,
    budgetRange: true,
    monthlyBudget: true,
    availability: true,
    // Ideal Supervisor & Terms — merged into step 2 (the form has only two steps)
    description: true,
    agreedToPost: true,
    agreedToTerms: true,
  })
  .superRefine((data, ctx) => {
    if (data.howSoon === 'CUSTOM_DATE' && !data.howSoonDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['howSoonDate'],
        message: 'Please select a date',
      })
    }
  })
  .superRefine(applySuperviseeSupervisionNeedRules)
  .superRefine(applySuperviseeBudgetRules)

export const SUPERVISEE_SIGNUP_STEP_SCHEMAS = [
  superviseeStep1Schema,
  superviseeStep2Schema,
] as const

export const SUPERVISEE_SIGNUP_STEP_FIELDS = [
  [
    'uploadProfilePhoto',
    'fullName',
    'email',
    'password',
    'confirmPassword',
    'contactNumber',
    'city',
    'state',
    'zipcode',
  ],
  [
    'occupationId',
    'specialtyId',
    'title',
    'licensureState',
    'typeOfSupervisor',
    'needsMedicalDirector',
    'supervisorOccupationId',
    'supervisorSpecialtyId',
    'preferredFormat',
    'stateOfLicensure',
    'howSoon',
    'howSoonDate',
    'availability',
    'feeType',
    'budgetRange',
    'monthlyBudget',
    'description',
    'agreedToPost',
    'agreedToTerms',
  ],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof SuperviseeFormValues>>

export const SUPERVISEE_SIGNUP_STEP_META = [
  { title: 'Account', stepLabel: 'Step 1' },
  { title: 'Supervision Needs & Terms', stepLabel: 'Step 2' },
] as const
