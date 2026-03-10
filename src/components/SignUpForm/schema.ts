import { z } from 'zod'

export const howSoonOptions = [
  'As soon as possible',
  'Within 1 month',
  'Within 3 months',
  'Just exploring',
] as const

export const howSoonSchema = z
  .string()
  .min(1, 'Please select how soon you are looking')
  .refine((val) => howSoonOptions.includes(val as (typeof howSoonOptions)[number]), {
    message: 'Please select a valid option',
  })

export const cityStateZipSchema = z
  .string()
  .min(1, 'City, State, Zipcode is required')
  .max(200, 'Must be 200 characters or less')

export const supervisorSchema = z.object({
  license: z.string().min(1, 'License is required').max(100),
  contactNumber: z.string().min(1, 'Contact number is required').max(20),
  yearOfExperience: z
    .string()
    .min(1, 'Year of experience is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number'),
  npiNumber: z.string().min(1, 'NPI number is required').max(20),
  expiration: z.string().min(1, 'Expiration date is required'),
  certification: z.string().min(1, 'Certification is required').max(200),
  patientPopulation: z.string().min(1, 'Patient population is required').max(500),
  licensePicture: z
    .any()
    .refine((val) => val instanceof File, 'Please upload a picture of your license'),
  cityStateZipcode: cityStateZipSchema,
})

export const superviseeSchema = z.object({
  typeOfSupervisor: z.string().min(1, 'Type of supervisor is required').max(200),
  supervisorDescription: z
    .string()
    .min(1, 'Please describe the supervisor you are looking for')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be 1000 characters or less'),
  cityStateZipcode: cityStateZipSchema,
  howSoon: howSoonSchema,
})

export type SupervisorFormValues = z.infer<typeof supervisorSchema>
export type SuperviseeFormValues = z.infer<typeof superviseeSchema>
