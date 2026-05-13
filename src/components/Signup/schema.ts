import { z } from 'zod'

import { normalizeNumberFieldInput } from '@/lib/utils/number-input'

// ─── Shared options ──────────────────────────────────────────────────────────

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

// ─── Supervisor schema ─────────────────────────────────────────────────────────

export const supervisorSchemaObject = accountSchemaBase.extend({
  // Occupation & specialty
  occupationId: z.string().min(1, 'Occupation is required'),
  specialtyId: z.string().optional(),

  // License & credentials
  licenseType: z.string().min(1, 'License type is required'),
  licenseNumber: z.string().min(1, 'License number is required').max(50),
  licenseExpiration: z
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
    ),
  npiNumber: z.string().max(20).optional(),
  certifications: z.array(z.string()).min(1, 'Add at least one certification'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  licenseDoc: z
    .any()
    .refine((val) => val instanceof File, 'Please upload your license or verification doc'),
  stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),

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

export const supervisorSchema = withPasswordConfirmation(supervisorSchemaObject)

// ─── Supervisee schema ─────────────────────────────────────────────────────────

export const superviseeSchemaObject = accountSchemaBase.extend({
  occupationId: z.string().min(1, 'Occupation is required'),

  stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
  stateTheyAreLookingIn: z
    .array(z.string())
    .min(1, 'Please select at least one state you are looking in'),
  typeOfSupervisor: z
    .array(z.string())
    .min(1, 'Please select at least one type of supervision needed'),
  howSoon: z.string().min(1, 'Please select how soon you need a supervisor'),
  howSoonDate: z.string().optional(),
  preferredFormat: z.enum(['virtual', 'in-person', 'hybrid'], {
    message: 'Please select a preferred format',
  }),
  feeType: z.enum(['per-session', 'monthly'], { message: 'Please select a fee type' }),
  budgetRange: z.string().min(1, 'Please select a budget range'),
  availability: z.string().min(1, 'Availability is required'),
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

export const superviseeSchema = withPasswordConfirmation(superviseeSchemaObject)

export type SupervisorFormValues = z.infer<typeof supervisorSchemaObject>
export type SuperviseeFormValues = z.infer<typeof superviseeSchemaObject>

// ─── Supervisor multi-step (same rules as supervisorSchema, split by step) ───

export const supervisorStep1Schema = withPasswordConfirmation(
  supervisorSchemaObject.pick({
    uploadProfilePhoto: true,
    fullName: true,
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

export const supervisorStep2Schema = supervisorSchemaObject.pick({
  occupationId: true,
  specialtyId: true,
  licenseType: true,
  licenseNumber: true,
  licenseExpiration: true,
  npiNumber: true,
  certifications: true,
  yearsOfExperience: true,
  licenseDoc: true,
  stateOfLicensure: true,
})

export const supervisorStep3Schema = supervisorSchemaObject.pick({
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
    'occupationId',
    'specialtyId',
    'licenseType',
    'licenseNumber',
    'licenseExpiration',
    'npiNumber',
    'certifications',
    'yearsOfExperience',
    'licenseDoc',
    'stateOfLicensure',
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
    stateOfLicensure: true,
    stateTheyAreLookingIn: true,
    typeOfSupervisor: true,
    howSoon: true,
    howSoonDate: true,
    preferredFormat: true,
    feeType: true,
    budgetRange: true,
    availability: true,
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

export const superviseeStep3Schema = superviseeSchemaObject.pick({
  description: true,
  agreedToPost: true,
  agreedToTerms: true,
})

export const SUPERVISEE_SIGNUP_STEP_SCHEMAS = [
  superviseeStep1Schema,
  superviseeStep2Schema,
  superviseeStep3Schema,
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
    'stateOfLicensure',
    'stateTheyAreLookingIn',
    'typeOfSupervisor',
    'howSoon',
    'howSoonDate',
    'preferredFormat',
    'feeType',
    'budgetRange',
    'availability',
  ],
  ['description', 'agreedToPost', 'agreedToTerms'],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof SuperviseeFormValues>>

export const SUPERVISEE_SIGNUP_STEP_META = [
  { title: 'Account', stepLabel: 'Step 1' },
  { title: 'Supervision Needs', stepLabel: 'Step 2' },
  { title: 'Profile & Terms', stepLabel: 'Step 3' },
] as const
