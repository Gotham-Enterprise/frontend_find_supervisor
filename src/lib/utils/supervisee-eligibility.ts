/**
 * Eligibility rules for which supervision types a supervisee may request,
 * based solely on their occupation. The occupation dropdown offers only
 * allowlisted supervisee occupations, so the occupation name is an exact
 * signal — no credential-text matching.
 *
 * Keep in sync with backend `utils/supervisee-eligibility.js`.
 */
import type { SupervisorTypeData } from '@/lib/api/options'

export const SUPERVISOR_TYPE_CODES = {
  COLLABORATING_PHYSICIAN: 'COLLABORATING_PHYSICIAN',
  SUPERVISING_PHYSICIAN: 'SUPERVISING_PHYSICIAN',
  MENTAL_HEALTH_COUNSELORS: 'MENTAL_HEALTH_COUNSELORS',
  MEDICAL_DIRECTOR: 'MEDICAL_DIRECTOR',
  PRECEPTOR: 'PRECEPTOR',
} as const

/** Fallback when hierarchy entries carry only a display name. */
const SUPERVISOR_TYPE_NAME_TO_CODE: Record<string, string> = {
  'collaborating physician': SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN,
  'supervising physician': SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN,
  'mental health counselors': SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS,
  'supervising mental health counselor': SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS,
  'medical director': SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR,
  preceptor: SUPERVISOR_TYPE_CODES.PRECEPTOR,
}

/** Display name of the Preceptor type as seeded in the backend. */
export const PRECEPTOR_TYPE_NAME = 'Preceptor'

/**
 * Preceptor occupations (SupervisorOccupation rows under the PRECEPTOR type).
 * Physician Assistants are deliberately not preceptors (product decision, 2026-11-24).
 */
export const PRECEPTOR_OCCUPATIONS = {
  NURSE_PRACTITIONER: 'Nurse Practitioner',
  PHYSICIAN: 'Physician',
  PHYSICAL_THERAPIST: 'Physical Therapist',
  PHARMACIST: 'Pharmacist',
  DENTIST: 'Dentist',
  OCCUPATIONAL_THERAPIST: 'Occupational Therapist',
  SPEECH_LANGUAGE_PATHOLOGIST: 'Speech Language Pathologist',
} as const

/**
 * Preceptee (student) occupations → the preceptor occupations that may host their
 * rotation. Students are college/program enrollees completing required field hours;
 * names carry "Student" so they never collide with the licensed "Nurse Practitioner" /
 * "Physician Assistant" supervisee occupations. Mirrors the backend matrix.
 */
export const PRECEPTEE_OCCUPATION_MATRIX: Record<string, readonly string[]> = {
  'Nurse Practitioner Student': [
    PRECEPTOR_OCCUPATIONS.NURSE_PRACTITIONER,
    PRECEPTOR_OCCUPATIONS.PHYSICIAN,
  ],
  'Physician Assistant Student': [
    PRECEPTOR_OCCUPATIONS.PHYSICIAN,
    PRECEPTOR_OCCUPATIONS.NURSE_PRACTITIONER,
  ],
  'Physical Therapy Student': [PRECEPTOR_OCCUPATIONS.PHYSICAL_THERAPIST],
  'Physical Therapist Assistant Student': [PRECEPTOR_OCCUPATIONS.PHYSICAL_THERAPIST],
  'Dental Hygiene Student': [PRECEPTOR_OCCUPATIONS.DENTIST],
  'Dental Assistant Student': [PRECEPTOR_OCCUPATIONS.DENTIST],
  'Occupational Therapy Assistant Student': [PRECEPTOR_OCCUPATIONS.OCCUPATIONAL_THERAPIST],
  'Speech Language Pathology Student': [PRECEPTOR_OCCUPATIONS.SPEECH_LANGUAGE_PATHOLOGIST],
  'Pharmacy Student': [PRECEPTOR_OCCUPATIONS.PHARMACIST],
}

export const PRECEPTEE_OCCUPATIONS = Object.keys(PRECEPTEE_OCCUPATION_MATRIX)

/** Display name of the Medical Director type as seeded in the backend. */
export const MEDICAL_DIRECTOR_TYPE_NAME = 'Medical Director'

const NURSE_PRACTITIONER_OCCUPATION = 'Nurse Practitioner'
const PHYSICIAN_ASSISTANT_OCCUPATION = 'Physician Assistant'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * The only occupations a supervisee may sign up under (per product rules):
 * one entry per allowlisted associate/intern-level mental health credential,
 * plus Nurse Practitioners and Physician Assistants. Names must match the
 * backend occupations list — the mental-health entries are supervision-only
 * rows (`isDropdown=false`) seeded by `prisma/seedSuperviseeOccupations.js`.
 */
export const SUPERVISEE_ALLOWED_OCCUPATIONS = [
  // Mental health — supervised by a Licensed Mental Health Counselor Supervisor.
  // LPCA (KY) and LPC-A (TX) share the "Licensed Professional Counselor Associate" entry.
  // Counseling
  'Associate Mental Health Counselor',
  'Licensed Mental Health Counselor Associate',
  'Licensed Clinical Mental Health Counselor Associate',
  'Licensed Professional Counselor Associate',
  'Provisional Licensed Professional Counselor',
  'Licensed Associate Counselor',
  'Licensed Associate Professional Counselor',
  'Licensed Graduate Professional Counselor',
  'Licensed Professional Counselor In Training',
  'Registered Mental Health Counselor Intern',
  'Mental Health Counselor, Limited Permit',
  // Marriage & Family Therapy
  'Associate Marriage and Family Therapist',
  'Licensed Marriage and Family Therapist Associate',
  'Licensed Associate Marriage and Family Therapist',
  'Marriage and Family Therapist Intern',
  'Registered Marriage and Family Therapist Intern',
  // Social Work
  'Associate Social Worker',
  'Licensed Social Worker',
  'Licensed Master Social Worker',
  'Licensed Graduate Social Worker',
  'Licensed Social Worker Associate Independent Clinical',
  // Psychology
  'Licensed Psychological Associate',
  'Psychologist Intern',
  // Healthcare — supervised by a Supervising/Collaborating Physician
  PHYSICIAN_ASSISTANT_OCCUPATION,
  NURSE_PRACTITIONER_OCCUPATION,
  // Students (preceptees) — hosted by a Preceptor; see PRECEPTEE_OCCUPATION_MATRIX
  ...PRECEPTEE_OCCUPATIONS,
] as const

const ALLOWED_OCCUPATIONS_NORMALIZED = new Set(
  SUPERVISEE_ALLOWED_OCCUPATIONS.map((name) => normalize(name)),
)

const PRECEPTEE_MATRIX_NORMALIZED = new Map(
  Object.entries(PRECEPTEE_OCCUPATION_MATRIX).map(([student, preceptors]) => [
    normalize(student),
    preceptors,
  ]),
)

export function isPrecepteeOccupation(occupationName: string): boolean {
  return PRECEPTEE_MATRIX_NORMALIZED.has(normalize(occupationName))
}

/** Preceptor occupation names a student of `occupationName` may request ([] when not a preceptee). */
export function getEligiblePreceptorOccupations(occupationName: string): string[] {
  return [...(PRECEPTEE_MATRIX_NORMALIZED.get(normalize(occupationName)) ?? [])]
}

/** Whether a preceptor with `preceptorOccupation` may host a student of `studentOccupation`. */
export function isPreceptorOccupationEligibleForPreceptee(
  preceptorOccupation: string,
  studentOccupation: string,
): boolean {
  const allowed = PRECEPTEE_MATRIX_NORMALIZED.get(normalize(studentOccupation))
  if (!allowed) return false
  const wanted = normalize(preceptorOccupation)
  return allowed.some((name) => normalize(name) === wanted)
}

/** Allowlisted mental-health occupations (everything except NP, PA and students). */
const MENTAL_HEALTH_OCCUPATIONS_NORMALIZED = new Set(
  SUPERVISEE_ALLOWED_OCCUPATIONS.filter(
    (name) =>
      name !== PHYSICIAN_ASSISTANT_OCCUPATION &&
      name !== NURSE_PRACTITIONER_OCCUPATION &&
      !isPrecepteeOccupation(name),
  ).map((name) => normalize(name)),
)

export function isAllowedSuperviseeOccupation(occupationName: string): boolean {
  return ALLOWED_OCCUPATIONS_NORMALIZED.has(normalize(occupationName))
}

export function isNursePractitionerOccupation(occupationName: string): boolean {
  return normalize(occupationName) === normalize(NURSE_PRACTITIONER_OCCUPATION)
}

export function isPhysicianAssistantOccupation(occupationName: string): boolean {
  return normalize(occupationName) === normalize(PHYSICIAN_ASSISTANT_OCCUPATION)
}

export function isMentalHealthSuperviseeOccupation(occupationName: string): boolean {
  return MENTAL_HEALTH_OCCUPATIONS_NORMALIZED.has(normalize(occupationName))
}

/**
 * Restricts the supervisee "Occupation" dropdown to `SUPERVISEE_ALLOWED_OCCUPATIONS`.
 * `keep` retains extra options regardless of the allowlist — used on profile edit so a
 * legacy occupation saved before this rule still renders as the selected value.
 * Students (preceptee occupations) have their own signup form and are excluded here;
 * `filterPrecepteeOccupationOptions` is the inverse.
 */
export function filterSuperviseeOccupationOptions<T extends { label: string }>(
  options: T[],
  keep?: (option: T) => boolean,
): T[] {
  return options.filter(
    (option) =>
      (isAllowedSuperviseeOccupation(option.label) && !isPrecepteeOccupation(option.label)) ||
      keep?.(option),
  )
}

/** The preceptee (student) signup "Program / Occupation" dropdown: students only. */
export function filterPrecepteeOccupationOptions<T extends { label: string }>(
  options: T[],
  keep?: (option: T) => boolean,
): T[] {
  return options.filter((option) => isPrecepteeOccupation(option.label) || keep?.(option))
}

/**
 * Splits the (already filtered) supervisee occupation options into labeled dropdown
 * groups: "Medical" (NP + PA) first, then "Mental Health". Anything outside the
 * allowlist (e.g. a kept legacy occupation on profile edit) falls into "Other".
 * Empty groups are omitted.
 */
export function groupSuperviseeOccupationOptions<T extends { label: string }>(
  options: readonly T[],
): { label: string; options: T[] }[] {
  const medical: T[] = []
  const mentalHealth: T[] = []
  const students: T[] = []
  const other: T[] = []
  for (const option of options) {
    if (
      isNursePractitionerOccupation(option.label) ||
      isPhysicianAssistantOccupation(option.label)
    ) {
      medical.push(option)
    } else if (isMentalHealthSuperviseeOccupation(option.label)) {
      mentalHealth.push(option)
    } else if (isPrecepteeOccupation(option.label)) {
      students.push(option)
    } else {
      other.push(option)
    }
  }
  return [
    { label: 'Medical', options: medical },
    { label: 'Mental Health', options: mentalHealth },
    { label: 'Students', options: students },
    { label: 'Other', options: other },
  ].filter((group) => group.options.length > 0)
}

/**
 * Display-only label overrides for the supervisee-facing "Type of Supervision
 * Needed" dropdown. The stored value stays the backend type name.
 */
const SUPERVISION_TYPE_DISPLAY_LABELS: Record<string, string> = {
  'mental health counselors': 'Mental Health Counselor Supervisor',
}

/**
 * Labels for the enum-code values the original signup stored in
 * typeOfSupervisorNeeded (backend commit 5f941bfa's supervisorTypeOptions).
 * Legacy accounts still carry these codes, so they must render as the label
 * the user actually picked — the generic humanizer below would mangle the
 * acronym-based ones (e.g. LPC_SUPERVISOR → "Lpc Supervisor").
 */
const LEGACY_SUPERVISION_TYPE_LABELS: Record<string, string> = {
  LPC_SUPERVISOR: 'LPC Supervisor',
  LPCC_SUPERVISOR: 'LPCC Supervisor',
  LMHC_SUPERVISOR: 'LMHC Supervisor',
  LMFT_SUPERVISOR: 'LMFT Supervisor',
  LCSW_SUPERVISOR: 'LCSW Supervisor',
  LICSW_SUPERVISOR: 'LICSW Supervisor',
  CLINICAL_SUPERVISOR: 'Clinical Supervisor',
  ACS: 'Approved Clinical Supervisor (ACS)',
  BOARD_APPROVED_SUPERVISOR: 'Board Approved Supervisor',
  FIELD_SUPERVISOR: 'Field Supervisor',
  PRECEPTOR: 'Preceptor',
  MENTAL_HEALTH_COUNSELORS: 'Mental Health Counselors',
  SUPERVISING_PHYSICIAN: 'Supervising Physician',
  COLLABORATING_PHYSICIAN: 'Collaborating Physician',
  MEDICAL_DIRECTOR: 'Medical Director',
}

/** "SOME_OLD_CODE" → "Some Old Code" — last resort for unlisted legacy codes. */
function humanizeEnumCode(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function supervisionTypeDisplayLabel(typeName: string): string {
  const trimmed = typeName.trim()
  // Legacy accounts stored the enum code rather than the display name.
  const resolved = /^[A-Z0-9_]+$/.test(trimmed)
    ? (LEGACY_SUPERVISION_TYPE_LABELS[trimmed] ?? humanizeEnumCode(trimmed))
    : trimmed
  return SUPERVISION_TYPE_DISPLAY_LABELS[normalize(resolved)] ?? resolved
}

export function resolveSupervisorTypeCode(type: { code?: string; name?: string }): string {
  if (type.code?.trim()) return type.code.trim().toUpperCase()
  return SUPERVISOR_TYPE_NAME_TO_CODE[normalize(type.name ?? '')] ?? ''
}

export function isMedicalDirectorType(type: { code?: string; name?: string }): boolean {
  return resolveSupervisorTypeCode(type) === SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR
}

export function isPreceptorType(type: { code?: string; name?: string }): boolean {
  return resolveSupervisorTypeCode(type) === SUPERVISOR_TYPE_CODES.PRECEPTOR
}

/**
 * Whether the supervisee may select the given supervision type.
 * Medical Director is available to every licensed supervisee; Preceptor only to
 * students (preceptee occupations), who in turn may pick nothing else.
 * Unknown/future types default to available for non-students.
 */
export function isSupervisorTypeEligibleForSupervisee(
  type: { code?: string; name?: string },
  occupationName: string,
): boolean {
  switch (resolveSupervisorTypeCode(type)) {
    case SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN:
      return isNursePractitionerOccupation(occupationName)
    case SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN:
      return isPhysicianAssistantOccupation(occupationName)
    case SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS:
      return isMentalHealthSuperviseeOccupation(occupationName)
    case SUPERVISOR_TYPE_CODES.PRECEPTOR:
      return isPrecepteeOccupation(occupationName)
    case SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR:
      return !isPrecepteeOccupation(occupationName)
    default:
      return !isPrecepteeOccupation(occupationName)
  }
}

/** True once the field that drives eligibility (occupation) is filled in. */
export function hasCompletedEligibilityFields(occupationName: string): boolean {
  return occupationName.trim().length > 0
}

/**
 * Supervision types offered in the "Type of Supervision Needed" dropdown.
 * Medical Director is excluded — it is requested via a separate checkbox instead,
 * since it can be combined with any supervision type (or stand alone). Preceptor is
 * excluded too — students sign up through the dedicated preceptee form, which
 * sets it directly.
 */
export function getEligibleSupervisorTypes(
  typesData: SupervisorTypeData[],
  occupationName: string,
): SupervisorTypeData[] {
  return typesData.filter(
    (type) =>
      !isMedicalDirectorType(type) &&
      !isPreceptorType(type) &&
      isSupervisorTypeEligibleForSupervisee(type, occupationName),
  )
}

/**
 * The value to keep for `typeOfSupervisor` after the occupation changes:
 * unchanged if still eligible, otherwise cleared.
 */
export function reconcileSelectedSupervisorType(
  selectedTypeName: string,
  typesData: SupervisorTypeData[],
  occupationName: string,
): string {
  if (!selectedTypeName) return selectedTypeName
  const selected = typesData.find((t) => t.name === selectedTypeName)
  // Unknown selection (options still loading) is left alone rather than wiped.
  if (!selected) return selectedTypeName
  return isSupervisorTypeEligibleForSupervisee(selected, occupationName) ? selectedTypeName : ''
}

export const SUPERVISION_TYPE_LOCKED_PLACEHOLDER = 'Select Your Occupation First'

export const INELIGIBLE_SUPERVISION_TYPE_MESSAGE =
  'This supervision type is not available for your occupation.'

export const SUPERVISION_TYPE_REQUIRED_MESSAGE =
  'Please select a type of supervision or check "I need a Medical Director".'

export const NO_ELIGIBLE_SUPERVISION_TYPES_PLACEHOLDER =
  'No Supervision Types Match Your Occupation'
