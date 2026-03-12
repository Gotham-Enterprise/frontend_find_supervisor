import { z } from 'zod'

// ─── Shared options ──────────────────────────────────────────────────────────

export const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
  'DC',
] as const

export const licenseTypeOptions = [
  'PT — Physical Therapist',
  'OT — Occupational Therapist',
  'LCSW — Licensed Clinical Social Worker',
  'LMFT — Licensed Marriage & Family Therapist',
  'LPC — Licensed Professional Counselor',
  'LMHC — Licensed Mental Health Counselor',
  'SLP — Speech Language Pathologist',
  'RN — Registered Nurse',
  'Other',
] as const

export const yearsOfExperienceOptions = [
  '0 – 2 years',
  '2 – 5 years',
  '5 – 10 years',
  '10 – 15 years',
  '15+ years',
] as const

export const supervisionFormatOptions = [
  { value: 'virtual', label: 'Virtual' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

export const availabilityOptions = [
  'Weekdays & Evenings',
  'Weekday mornings',
  'Weekday afternoons',
  'Weekends',
  'Flexible',
] as const

export const howSoonOptions = [
  'As soon as possible',
  'Within 1 month',
  'Within 3 months',
  'Just exploring',
] as const

export const budgetRangeOptions = [
  '$50 – $100 / session',
  '$100 – $150 / session',
  '$150 – $200 / session',
  '$200+ / session',
  'Open to discussion',
] as const

export const supervisorTypeOptions = [
  'Licensed Clinical Social Worker',
  'Marriage & Family Therapist',
  'Licensed Professional Counselor',
  'Physical Therapist',
  'Occupational Therapist',
  'Speech Language Pathologist',
  'Registered Nurse',
  'Other',
] as const

// ─── Shared sub-schemas ───────────────────────────────────────────────────────

const accountSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  contactNumber: z.string().min(1, 'Contact number is required').max(20),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required'),
  zipcode: z
    .string()
    .min(5, 'Zipcode must be at least 5 digits')
    .max(10)
    .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid US zipcode'),
})

// ─── Supervisor schema ─────────────────────────────────────────────────────────

export const supervisorSchema = accountSchema.extend({
  // License & credentials
  licenseType: z.string().min(1, 'License type is required'),
  licenseNumber: z.string().min(1, 'License number is required').max(50),
  licenseExpiration: z.string().min(1, 'Expiration date is required'),
  npiNumber: z.string().max(20).optional(),
  certifications: z.array(z.string()).min(1, 'Add at least one certification'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  licenseDoc: z
    .any()
    .refine((val) => val instanceof File, 'Please upload your license or verification doc'),

  // Practice details
  patientPopulation: z.array(z.string()).min(1, 'Add at least one patient population'),
  supervisionFormat: z.enum(['virtual', 'in-person', 'hybrid'], {
    message: 'Please select a supervision format',
  }),
  availability: z.string().min(1, 'Availability is required'),
  acceptingNewSupervisees: z.boolean(),
  bio: z
    .string()
    .min(20, 'Bio must be at least 20 characters')
    .max(500, 'Bio must be 500 characters or less'),

  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms to continue'),
})

// ─── Supervisee schema ─────────────────────────────────────────────────────────

export const superviseeSchema = accountSchema.extend({
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

  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms to continue'),
})

export type SupervisorFormValues = z.infer<typeof supervisorSchema>
export type SuperviseeFormValues = z.infer<typeof superviseeSchema>
