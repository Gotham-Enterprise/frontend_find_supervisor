import {
  type MedicalDirectorFormValues,
  OFFERING_SUPERVISOR_TYPE_NAMES,
  type OfferingKey,
  type SuperviseeFormValues,
  type SupervisorFormValues,
} from '@/components/Signup/schema'
import { OTHER_CERTIFYING_BOARD_VALUE } from '@/lib/utils/board-certification'
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

/**
 * Supervisor registration input — plain supervisors carry no offering or
 * board-certification fields, the Medical Director variant includes them
 * (see buildOfferingsPayload / buildBoardCertificationsPayload).
 */
export type SupervisorRegisterValues = SupervisorFormValues &
  Partial<
    Pick<
      MedicalDirectorFormValues,
      | 'offerSupervisingPhysician'
      | 'offerCollaboratingPhysician'
      | 'offerings'
      | 'boardCertified'
      | 'boardCertifications'
    >
  >

export type OfferingPayload = {
  supervisorType: string
  occupation: string
  specialty?: string
  degreeType: string
  licenses: { licenseNumber: string; state: string; licenseExpiration: string }[]
}

/** Minimal form shape the offering payload builder needs — shared by signup and profile edit. */
export type OfferingFormFields = Partial<
  Pick<
    MedicalDirectorFormValues,
    'offerSupervisingPhysician' | 'offerCollaboratingPhysician' | 'offerings'
  >
>

/**
 * One payload entry per CHECKED offering. Offering types are physician types,
 * so license entries carry no licenseType (mirrors the primary `licenses`
 * convention for physicians).
 */
export function buildOfferingsPayload(values: OfferingFormFields): OfferingPayload[] {
  const checkedKeys: OfferingKey[] = []
  if (values.offerSupervisingPhysician) checkedKeys.push('supervising')
  if (values.offerCollaboratingPhysician) checkedKeys.push('collaborating')

  return checkedKeys.flatMap((key) => {
    const block = values.offerings?.[key]
    if (!block) return []
    return [
      {
        supervisorType: OFFERING_SUPERVISOR_TYPE_NAMES[key],
        occupation: block.occupation,
        ...(block.specialty ? { specialty: block.specialty } : {}),
        degreeType: block.degreeType,
        licenses: block.licenses.map(({ licenseNumber, state, licenseExpiration }) => ({
          licenseNumber,
          state,
          licenseExpiration,
        })),
      },
    ]
  })
}

export type BoardCertificationPayload = {
  certifyingBoard: string
  specialty: string
  subspecialty?: string
  certificationNumber?: string
  expirationDate?: string
}

/** Minimal form shape the board-cert payload builder needs — shared by signup and profile edit. */
export type BoardCertificationFormFields = Partial<
  Pick<MedicalDirectorFormValues, 'boardCertified' | 'boardCertifications'>
>

/**
 * One payload entry per board certification — only when "Board Certified?" is
 * Yes. "Other" resolves to the free-text board name; empty optionals are
 * omitted.
 */
export function buildBoardCertificationsPayload(
  values: BoardCertificationFormFields,
): BoardCertificationPayload[] {
  if (!values.boardCertified) return []

  return (values.boardCertifications ?? []).map((entry) => ({
    certifyingBoard:
      entry.certifyingBoard === OTHER_CERTIFYING_BOARD_VALUE
        ? entry.certifyingBoardOther
        : entry.certifyingBoard,
    specialty: entry.specialty,
    ...(entry.subspecialty ? { subspecialty: entry.subspecialty } : {}),
    ...(entry.certificationNumber ? { certificationNumber: entry.certificationNumber } : {}),
    ...(entry.expirationDate ? { expirationDate: entry.expirationDate } : {}),
  }))
}

export function buildSupervisorFormData(values: SupervisorRegisterValues): FormData {
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
  // Medical Director secondary offerings — appended only when at least one is checked
  const offerings = buildOfferingsPayload(values)
  if (offerings.length > 0) fd.append('offerings', JSON.stringify(offerings))
  // Medical Director board certifications — appended only when "Board Certified?" is Yes
  const boardCertifications = buildBoardCertificationsPayload(values)
  if (boardCertifications.length > 0) {
    fd.append('boardCertifications', JSON.stringify(boardCertifications))
  }
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
  // Supervision-side preferences — sent only when a supervision type is
  // selected; an MD-only signup uses the md* fields below instead.
  if (values.typeOfSupervisor) {
    // Desired supervisor occupation/specialty — stored as plain strings on SuperviseeProfile
    if (values.supervisorOccupationId)
      fd.append('superviseeOccupation', values.supervisorOccupationId)
    if (values.supervisorSpecialtyId) fd.append('superviseeSpecialty', values.supervisorSpecialtyId)
    // Backend field: howSoonLooking + enum transformation
    fd.append('howSoonLooking', HOW_SOON_MAP[values.howSoon] ?? 'IMMEDIATELY')
    if (values.howSoon === 'CUSTOM_DATE' && values.howSoonDate) {
      fd.append('lookingDate', values.howSoonDate)
    }
    // Budget — backend `budgetRangeType` must be HOURLY | MONTHLY (see supervision_validator).
    // Monthly is a single amount stored in `budgetRangeEnd` (start is 0); Hourly picks a range.
    const budget =
      values.feeType === 'monthly'
        ? { start: 0, end: values.monthlyBudget ?? 0 }
        : parseBudgetRange(values.budgetRange)
    fd.append('budgetRangeType', feeTypeToBudgetRangeType(values.feeType))
    fd.append('budgetRangeStart', String(budget.start))
    fd.append('budgetRangeEnd', String(budget.end))
  }

  // Medical Director need preferences — md* columns on SuperviseeProfile
  // (required by the backend when "Medical Director" is among the needs).
  if (values.needsMedicalDirector) {
    if (values.mdPreferredOccupationId)
      fd.append('mdPreferredOccupation', values.mdPreferredOccupationId)
    if (values.mdPreferredSpecialtyId)
      fd.append('mdPreferredSpecialty', values.mdPreferredSpecialtyId)
    fd.append('mdHowSoonLooking', HOW_SOON_MAP[values.mdHowSoon] ?? 'IMMEDIATELY')
    if (values.mdHowSoon === 'CUSTOM_DATE' && values.mdHowSoonDate) {
      fd.append('mdLookingDate', values.mdHowSoonDate)
    }
    fd.append('mdMonthlyBudget', String(values.mdMonthlyBudget ?? 0))
    // Combined signups have their own MD description; MD-only flows (regular
    // and the dedicated variant) reuse the main description (relabeled in the UI)
    fd.append(
      'mdIdealDescription',
      values.typeOfSupervisor ? (values.mdIdealDescription ?? '') : values.description,
    )
  }

  fd.append('preferredFormat', FORMAT_MAP[values.preferredFormat])
  fd.append('availability', values.availability)
  // Backend field: idealSupervisor
  fd.append('idealSupervisor', values.description)
  if (values.introduction?.trim()) fd.append('introduction', values.introduction)

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
  values: SupervisorRegisterValues,
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
