import type { SuperviseeFormValues, SupervisorFormValues } from '@/components/Signup/schema'
import { normalizeUSPhoneNumber } from '@/lib/utils/phone'

import { apiClient } from './client'

// ─── Enum maps ────────────────────────────────────────────────────────────────

const FORMAT_MAP: Record<'virtual' | 'in-person' | 'hybrid', string> = {
  virtual: 'VIRTUAL',
  'in-person': 'IN_PERSON',
  hybrid: 'HYBRID',
}

const HOW_SOON_MAP: Record<string, string> = {
  'As soon as possible': 'IMMEDIATELY',
  'Within 1 month': 'WITHIN_1_MONTH',
  'Within 3 months': 'WITHIN_2_MONTHS',
  'Just exploring': 'WITHIN_6_MONTHS',
}

interface BudgetParsed {
  budgetRangeType: 'HOURLY' | 'MONTHLY'
  budgetRangeStart: number
  budgetRangeEnd: number
}

function parseBudgetRange(budgetRange: string): BudgetParsed {
  const map: Record<string, { start: number; end: number }> = {
    '$0 - $50': { start: 0, end: 50 },
    '$51 - $100': { start: 51, end: 100 },
    '$101 - $150': { start: 101, end: 150 },
    '$50 – $100 / session': { start: 50, end: 100 },
    '$100 – $150 / session': { start: 100, end: 150 },
    '$150 – $200 / session': { start: 150, end: 200 },
    '$200+ / session': { start: 200, end: 500 },
    'Open to discussion': { start: 0, end: 0 },
  }
  const parsed = map[budgetRange] ?? { start: 0, end: 0 }
  return { budgetRangeType: 'HOURLY', budgetRangeStart: parsed.start, budgetRangeEnd: parsed.end }
}

// ─── FormData builders ────────────────────────────────────────────────────────

export function buildSupervisorFormData(values: SupervisorFormValues): FormData {
  const fd = new FormData()

  // Account
  fd.append('role', 'SUPERVISOR')
  fd.append('fullName', values.fullName)
  fd.append('email', values.email)
  fd.append('password', values.password)
  fd.append('contactNumber', normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
  fd.append('city', values.city)
  fd.append('state', values.state)
  fd.append('zipcode', values.zipcode)

  // Occupation & specialty — backend expects `occupation` / `specialty` (string IDs), not *Id keys
  fd.append('occupation', values.occupationId)
  if (values.specialtyId) fd.append('specialty', values.specialtyId)
  if (values.website) fd.append('website', values.website)

  // License & credentials
  fd.append('licenseType', values.licenseType)
  fd.append('licenseNumber', values.licenseNumber)
  fd.append('licenseExpiration', values.licenseExpiration)
  // Backend field is singular: yearOfExperience
  fd.append('yearsOfExperience', values.yearsOfExperience)
  if (values.npiNumber) fd.append('npiNumber', values.npiNumber)
  // Backend field is singular: certification
  values.certifications.forEach((cert) => fd.append('certification', cert))

  // Practice
  values.patientPopulation.forEach((p) => fd.append('patientPopulation', p))
  values.stateOfLicensure.forEach((s) => fd.append('stateOfLicensure', s))
  fd.append('supervisionFormat', FORMAT_MAP[values.supervisionFormat])
  fd.append('availability', values.availability)
  // Backend field: acceptingSupervisees (not acceptingNewSupervisees)
  fd.append('acceptingSupervisees', String(values.acceptingNewSupervisees))
  fd.append('describeYourself', values.describeYourself)
  fd.append('professionalSummary', values.professionalSummary)

  // Fee
  fd.append('supervisionFeeType', values.supervisionFeeType)
  fd.append('supervisionFeeAmount', String(values.supervisionFeeAmount))

  fd.append('agreedToTerms', String(values.agreedToTerms))
  fd.append('agreedToPost', String(values.agreedToPost))

  // Files
  fd.append('uploadLicense', values.licenseDoc as File)
  fd.append('uploadProfilePhoto', values.uploadProfilePhoto as File)

  return fd
}

export function buildSuperviseeFormData(values: SuperviseeFormValues): FormData {
  const fd = new FormData()

  // Account
  fd.append('role', 'SUPERVISEE')
  fd.append('fullName', values.fullName)
  fd.append('email', values.email)
  fd.append('password', values.password)
  fd.append('contactNumber', normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
  fd.append('city', values.city)
  fd.append('state', values.state)
  fd.append('zipcode', values.zipcode)

  // Supervision needs
  values.stateOfLicensure.forEach((s) => fd.append('stateOfLicensure', s))
  fd.append('stateTheyAreLookingIn', values.stateTheyAreLookingIn)
  // Backend field: typeOfSupervisorNeeded
  fd.append('typeOfSupervisorNeeded', values.typeOfSupervisor)
  // Backend field: howSoonLooking + enum transformation
  fd.append('howSoonLooking', HOW_SOON_MAP[values.howSoon] ?? 'IMMEDIATELY')
  fd.append('preferredFormat', FORMAT_MAP[values.preferredFormat])
  fd.append('availability', values.availability)
  // Backend field: idealSupervisor
  fd.append('idealSupervisor', values.description)

  // Budget — split string into type + start + end
  const budget = parseBudgetRange(values.budgetRange)
  fd.append('budgetRangeType', budget.budgetRangeType)
  fd.append('budgetRangeStart', String(budget.budgetRangeStart))
  fd.append('budgetRangeEnd', String(budget.budgetRangeEnd))

  // Terms
  fd.append('agreedToTerms', String(values.agreedToTerms))
  fd.append('agreedToPost', String(values.agreedToPost))

  // File
  fd.append('uploadProfilePhoto', values.uploadProfilePhoto as File)

  return fd
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface SignupUser {
  fullName: string
  email: string
  role: 'SUPERVISOR' | 'SUPERVISEE'
  emailVerified: boolean
}

export interface SignupSuccessResponse {
  success: true
  message: string
  data: {
    user: SignupUser
    activationToken: string
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function registerSupervisor(
  values: SupervisorFormValues,
): Promise<SignupSuccessResponse> {
  const formData = buildSupervisorFormData(values)
  // Do not set Content-Type manually — axios detects FormData and sets multipart/form-data with the correct boundary
  const { data } = await apiClient.post<SignupSuccessResponse>(
    '/supervision/supervisor/register',
    formData,
    { headers: { 'Content-Type': undefined } },
  )
  return data
}

export async function registerSupervisee(
  values: SuperviseeFormValues,
): Promise<SignupSuccessResponse> {
  const formData = buildSuperviseeFormData(values)
  const { data } = await apiClient.post<SignupSuccessResponse>(
    '/supervision/supervisee/register',
    formData,
    { headers: { 'Content-Type': undefined } },
  )
  return data
}
