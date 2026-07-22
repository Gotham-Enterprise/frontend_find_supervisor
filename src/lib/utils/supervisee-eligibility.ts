/**
 * Eligibility rules for which supervision types a supervisee may request,
 * based on their own occupation and credential/license type.
 *
 * Keep in sync with backend `utils/supervisee-eligibility.js`.
 */
import type { SupervisorTypeData } from '@/lib/api/options'

export const SUPERVISOR_TYPE_CODES = {
  COLLABORATING_PHYSICIAN: 'COLLABORATING_PHYSICIAN',
  SUPERVISING_PHYSICIAN: 'SUPERVISING_PHYSICIAN',
  MENTAL_HEALTH_COUNSELORS: 'MENTAL_HEALTH_COUNSELORS',
  MEDICAL_DIRECTOR: 'MEDICAL_DIRECTOR',
} as const

/** Fallback when hierarchy entries carry only a display name. */
const SUPERVISOR_TYPE_NAME_TO_CODE: Record<string, string> = {
  'collaborating physician': SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN,
  'supervising physician': SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN,
  'mental health counselors': SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS,
  'supervising mental health counselor': SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS,
  'medical director': SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR,
}

export type SuperviseeEligibilityContext = {
  /** Display name of the supervisee's occupation (from the occupations list). */
  occupationName: string
  /** Free-text credential or license type, e.g. "AMFT", "LPC-Associate". */
  credentialTitle: string
}

const NURSE_PRACTITIONER_PHRASES = ['nurse practitioner']
const NURSE_PRACTITIONER_TOKENS = ['np', 'aprn', 'fnp', 'pmhnp', 'agnp', 'crnp', 'dnp']

const PHYSICIAN_ASSISTANT_PHRASES = ['physician assistant', 'physician associate']
const PHYSICIAN_ASSISTANT_TOKENS = ['pa', 'pa-c', 'apa-c']

/** Pre-licensed / associate-level mental health credentials (per product eligibility rules). */
const MENTAL_HEALTH_PHRASES = [
  'associate',
  'intern',
  'limited permit',
  'trainee',
  'provisional',
  'pre-licensed',
  'psychological assistant',
  'postdoc',
]
const MENTAL_HEALTH_TOKENS = [
  'amft',
  'acsw',
  'lsw',
  'apc',
  'apcc',
  'lmhca',
  'lmsw',
  'lgsw',
  'cswa',
  'plpc',
  'lpca',
  'lpc-a',
  'lac',
  'alc',
  'lcmhca',
  'lmfta',
  'lamft',
  'mfti',
  'rmfti',
  'rmhci',
  'mhc-lp',
  'lpc-it',
  'lgpc',
  'lapc',
  'lswaic',
  'lpa',
]

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/** Splits on anything that is not a letter, digit, or hyphen ("LPC-Associate" → ["lpc-associate"]). */
function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9-]+/)
    .filter(Boolean)
}

function matchesAny(
  ctx: SuperviseeEligibilityContext,
  phrases: string[],
  tokens: string[],
): boolean {
  const haystacks = [normalize(ctx.occupationName), normalize(ctx.credentialTitle)]
  if (haystacks.some((text) => phrases.some((phrase) => text.includes(phrase)))) return true

  const allTokens = new Set([
    ...tokenize(ctx.occupationName),
    ...tokenize(ctx.credentialTitle),
    // "LPC-Associate" should also match the "associate"/"lpc" halves
    ...tokenize(ctx.credentialTitle.replace(/-/g, ' ')),
  ])
  return tokens.some((token) => allTokens.has(token))
}

export function isNursePractitioner(ctx: SuperviseeEligibilityContext): boolean {
  return matchesAny(ctx, NURSE_PRACTITIONER_PHRASES, NURSE_PRACTITIONER_TOKENS)
}

export function isPhysicianAssistant(ctx: SuperviseeEligibilityContext): boolean {
  return matchesAny(ctx, PHYSICIAN_ASSISTANT_PHRASES, PHYSICIAN_ASSISTANT_TOKENS)
}

export function isEligibleMentalHealthSupervisee(ctx: SuperviseeEligibilityContext): boolean {
  // NPs and PAs never qualify for mental-health supervision, even when their title
  // hits a generic phrase (e.g. "Physician Associate" contains "associate").
  if (isNursePractitioner(ctx) || isPhysicianAssistant(ctx)) return false
  return matchesAny(ctx, MENTAL_HEALTH_PHRASES, MENTAL_HEALTH_TOKENS)
}

export function resolveSupervisorTypeCode(type: { code?: string; name?: string }): string {
  if (type.code?.trim()) return type.code.trim().toUpperCase()
  return SUPERVISOR_TYPE_NAME_TO_CODE[normalize(type.name ?? '')] ?? ''
}

/**
 * Whether the supervisee may select the given supervision type.
 * Medical Director is always available; unknown/future types default to available.
 */
export function isSupervisorTypeEligibleForSupervisee(
  type: { code?: string; name?: string },
  ctx: SuperviseeEligibilityContext,
): boolean {
  switch (resolveSupervisorTypeCode(type)) {
    case SUPERVISOR_TYPE_CODES.COLLABORATING_PHYSICIAN:
      return isNursePractitioner(ctx)
    case SUPERVISOR_TYPE_CODES.SUPERVISING_PHYSICIAN:
      return isPhysicianAssistant(ctx)
    case SUPERVISOR_TYPE_CODES.MENTAL_HEALTH_COUNSELORS:
      return isEligibleMentalHealthSupervisee(ctx)
    case SUPERVISOR_TYPE_CODES.MEDICAL_DIRECTOR:
      return true
    default:
      return true
  }
}

/** True once the fields that drive eligibility are filled in. */
export function hasCompletedEligibilityFields(ctx: SuperviseeEligibilityContext): boolean {
  return ctx.credentialTitle.trim().length > 0 && ctx.occupationName.trim().length > 0
}

export function getEligibleSupervisorTypes(
  typesData: SupervisorTypeData[],
  ctx: SuperviseeEligibilityContext,
): SupervisorTypeData[] {
  return typesData.filter((type) => isSupervisorTypeEligibleForSupervisee(type, ctx))
}

/**
 * The value to keep for `typeOfSupervisor` after the eligibility fields change:
 * unchanged if still eligible, otherwise cleared.
 */
export function reconcileSelectedSupervisorType(
  selectedTypeName: string,
  typesData: SupervisorTypeData[],
  ctx: SuperviseeEligibilityContext,
): string {
  if (!selectedTypeName) return selectedTypeName
  const selected = typesData.find((t) => t.name === selectedTypeName)
  // Unknown selection (options still loading) is left alone rather than wiped.
  if (!selected) return selectedTypeName
  return isSupervisorTypeEligibleForSupervisee(selected, ctx) ? selectedTypeName : ''
}

export const SUPERVISION_TYPE_LOCKED_PLACEHOLDER = 'Enter your credential and occupation first'

export const INELIGIBLE_SUPERVISION_TYPE_MESSAGE =
  'This supervision type is not available for your occupation and credentials.'
