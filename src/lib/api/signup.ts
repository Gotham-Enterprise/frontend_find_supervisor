import type { SuperviseeFormValues, SupervisorFormValues } from '@/components/Signup/schema'
import { normalizeUSPhoneNumber } from '@/lib/utils/phone'
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'
import { isPhysicianSupervisorType } from '@/lib/utils/supervisor-type'

import { apiClient } from './client'

// ─── Enum maps ────────────────────────────────────────────────────────────────

const FORMAT_MAP: Record<'virtual' | 'in-person' | 'hybrid', string> = {
  virtual: 'VIRTUAL',
  'in-person': 'IN_PERSON',
  hybrid: 'HYBRID',
}

/** The form stores backend enum values directly; this only guards against unexpected input. */
const HOW_SOON_MAP: Record<string, string> = {
  IMMEDIATELY: 'IMMEDIATELY',
  WITHIN_2_WEEKS: 'WITHIN_2_WEEKS',
  WITHIN_1_MONTH: 'WITHIN_1_MONTH',
  WITHIN_2_MONTHS: 'WITHIN_2_MONTHS',
  WITHIN_6_MONTHS: 'WITHIN_6_MONTHS',
  CUSTOM_DATE: 'CUSTOM_DATE',
}

/** Matches `validateSuperviseeRegister` — only `HOURLY` and `MONTHLY` are allowed. */
function feeTypeToBudgetRangeType(feeType: SuperviseeFormValues['feeType']): 'HOURLY' | 'MONTHLY' {
  return feeType === 'monthly' ? 'MONTHLY' : 'HOURLY'
}

function parseBudgetRange(budgetRange: string): { start: number; end: number } {
  const map: Record<string, { start: number; end: number }> = {
    '$0 - $50': { start: 0, end: 50 },
    '$51 - $100': { start: 51, end: 100 },
    '$101 - $150': { start: 101, end: 150 },
    '$151 - $300': { start: 151, end: 300 },
    'Open to discussion': { start: 0, end: 0 },
  }
  return map[budgetRange] ?? { start: 0, end: 0 }
}

// ─── FormData builders ────────────────────────────────────────────────────────
// `confirmPassword` is client-only and must not be sent to the API.

export function buildSupervisorFormData(values: SupervisorFormValues): FormData {
  const fd = new FormData()

  // Account
  fd.append('role', 'SUPERVISOR')
  fd.append('fullName', values.fullName)
  const professionalCredentials = values.professionalCredentials?.trim()
  if (professionalCredentials) fd.append('professionalCredentials', professionalCredentials)
  fd.append('email', values.email)
  fd.append('password', values.password)
  fd.append('contactNumber', normalizeUSPhoneNumber(values.contactNumber) ?? values.contactNumber)
  fd.append('city', values.city)
  fd.append('state', values.state)
  fd.append('zipcode', values.zipcode)

  // Occupation/specialty from the supervisor-type hierarchy — stored as plain strings on SupervisorProfile
  fd.append('occupation', values.supervisorOccupationId)
  if (values.supervisorSpecialtyId) fd.append('specialty', values.supervisorSpecialtyId)
  if (values.website) fd.append('website', values.website)

  // License & credentials
  const physician = isPhysicianSupervisorType(values.supervisorType)
  if (physician) {
    fd.append('degreeType', values.degreeType)
  }
  fd.append('supervisorType', values.supervisorType)
  // One entry per license, each with its own state, sent as a single JSON
  // field (nested objects are unreliable via multipart bracket keys).
  // Physicians carry no per-entry licenseType (degreeType is shared).
  fd.append(
    'licenses',
    JSON.stringify(
      values.licenses.map(({ licenseType, licenseNumber, state, licenseExpiration }) => ({
        ...(physician ? {} : { licenseType }),
        licenseNumber,
        state,
        licenseExpiration,
      })),
    ),
  )
  fd.append('yearsOfExperience', values.yearsOfExperience)
  if (values.npiNumber) fd.append('npiNumber', values.npiNumber)
  if (!physician) {
    values.certifications.forEach((cert) => fd.append('certification', cert))
  }

  // Practice
  values.patientPopulation.forEach((p) => fd.append('patientPopulation', p))
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

  fd.append('occupation', values.occupationId)
  fd.append('title', values.title)
  // State tied to the credential/title (US state abbreviation, e.g. "TX")
  fd.append('licensureState', values.licensureState)
  if (values.specialtyId) fd.append('specialty', values.specialtyId)

  // Supervision needs — `stateOfLicensure[]` so a single state is still parsed as an array (multer + express-validator .isArray())
  values.stateOfLicensure.forEach((s) => fd.append('stateOfLicensure[]', s))
  // Backend field: typeOfSupervisorNeeded[] — the selected supervision type plus
  // Medical Director when its checkbox is ticked (the checkbox can also stand alone)
  const supervisionTypes = new Set(
    [values.typeOfSupervisor, values.needsMedicalDirector ? MEDICAL_DIRECTOR_TYPE_NAME : ''].filter(
      Boolean,
    ),
  )
  supervisionTypes.forEach((t) => fd.append('typeOfSupervisorNeeded[]', t))
  // Desired supervisor occupation/specialty — stored as plain strings on SuperviseeProfile
  if (values.supervisorOccupationId)
    fd.append('superviseeOccupation', values.supervisorOccupationId)
  if (values.supervisorSpecialtyId) fd.append('superviseeSpecialty', values.supervisorSpecialtyId)
  // Backend field: howSoonLooking + enum transformation
  fd.append('howSoonLooking', HOW_SOON_MAP[values.howSoon] ?? 'IMMEDIATELY')
  if (values.howSoon === 'CUSTOM_DATE' && values.howSoonDate) {
    fd.append('lookingDate', values.howSoonDate)
  }
  fd.append('preferredFormat', FORMAT_MAP[values.preferredFormat])
  fd.append('availability', values.availability)
  // Backend field: idealSupervisor
  fd.append('idealSupervisor', values.description)

  // Budget — backend `budgetRangeType` must be HOURLY | MONTHLY (see supervision_validator).
  // Monthly is a single amount stored in `budgetRangeEnd` (start is 0); Hourly picks a range.
  const budget =
    values.feeType === 'monthly'
      ? { start: 0, end: values.monthlyBudget ?? 0 }
      : parseBudgetRange(values.budgetRange)
  fd.append('budgetRangeType', feeTypeToBudgetRangeType(values.feeType))
  fd.append('budgetRangeStart', String(budget.start))
  fd.append('budgetRangeEnd', String(budget.end))

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
