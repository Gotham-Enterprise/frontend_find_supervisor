import { z } from 'zod'

import { isValidUSPhoneNumber } from '@/lib/utils/phone'

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
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .refine(isValidUSPhoneNumber, 'Please enter a valid US phone number.'),
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

  agreedToPost: z.boolean().refine((val) => val === true, 'You must agree to post your profile'),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms and conditions'),
})

// ─── Supervisee schema ─────────────────────────────────────────────────────────

export const superviseeSchema = accountSchema.extend({
  stateOfLicensure: z.array(z.string()).min(1, 'At least one state of licensure is required'),
  stateTheyAreLookingIn: z.string().min(1, 'Please select the state you are looking in'),
  typeOfSupervisor: z.string().min(1, 'Please select a supervisor type'),
  howSoon: z.string().min(1, 'Please select how soon you need a supervisor'),
  preferredFormat: z.enum(['virtual', 'in-person', 'hybrid'], {
    message: 'Please select a preferred format',
  }),
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
