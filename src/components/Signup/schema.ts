import { z } from 'zod'

// ─── Shared options ──────────────────────────────────────────────────────────

export const yearsOfExperienceOptions = [
  '0 – 2 years',
  '2 – 5 years',
  '5 – 10 years',
  '10 – 15 years',
  '15+ years',
] as const

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const accountSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
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

export const supervisionFeeTypeOptions = [
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'MONTHLY', label: 'Monthly' },
] as const

// ─── Supervisor schema ─────────────────────────────────────────────────────────

export const supervisorSchema = accountSchema.extend({
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
  supervisionFeeAmount: z
    .number({ message: 'Fee amount is required' })
    .min(1, 'Fee amount must be at least 1'),

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

// ─── Supervisee schema ─────────────────────────────────────────────────────────

export const superviseeSchema = accountSchema.extend({
  occupationId: z.string().min(1, 'Occupation is required'),

  stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
  stateTheyAreLookingIn: z.string().min(1, 'Please select the state you are looking in'),
  typeOfSupervisor: z.string().min(1, 'Please select a supervisor type'),
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

export type SupervisorFormValues = z.infer<typeof supervisorSchema>
export type SuperviseeFormValues = z.infer<typeof superviseeSchema>

// ─── Supervisor multi-step (same rules as supervisorSchema, split by step) ───

export const supervisorStep1Schema = supervisorSchema.pick({
  uploadProfilePhoto: true,
  fullName: true,
  email: true,
  password: true,
  contactNumber: true,
  city: true,
  state: true,
  zipcode: true,
  website: true,
})

export const supervisorStep2Schema = supervisorSchema.pick({
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

export const supervisorStep3Schema = supervisorSchema.pick({
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

export const superviseeStep1Schema = superviseeSchema.pick({
  uploadProfilePhoto: true,
  fullName: true,
  email: true,
  password: true,
  contactNumber: true,
  city: true,
  state: true,
  zipcode: true,
})

export const superviseeStep2Schema = superviseeSchema
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

export const superviseeStep3Schema = superviseeSchema.pick({
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
