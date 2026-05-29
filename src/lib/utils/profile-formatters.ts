import type { SelectOption } from '@/lib/api/options'
import { SUPERVISOR_TYPE_QUERY_MAP } from '@/lib/seo/routes'
import { formatUSPhoneForDisplay } from '@/lib/utils/phone'

// ─── Display name ──────────────────────────────────────────────────────────────

/** Prefer fullName, then firstName + lastName, then userName, then fallback. */
export function formatDisplayName(user: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  userName?: string | null
}): string {
  if (user.fullName?.trim()) return user.fullName.trim()
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (composed) return composed
  if (user.userName?.trim()) return user.userName.trim()
  return 'Unknown'
}

// ─── Location ─────────────────────────────────────────────────────────────────

export function formatLocation(
  city: string | null | undefined,
  state: string | null | undefined,
  zipcode?: string | null,
): string {
  const parts = [city, state].filter(Boolean).join(', ')
  if (!parts) return 'N/A'
  return zipcode ? `${parts} ${zipcode}` : parts
}

/** City and state for compact UI; null when both missing (unlike {@link formatLocation}). */
export function formatCityStateLine(
  city: string | null | undefined,
  state: string | null | undefined,
): string | null {
  const c = city?.trim()
  const s = state?.trim()
  if (c && s) return `${c}, ${s}`
  return c || s || null
}

// ─── Date ─────────────────────────────────────────────────────────────────────

/** Formats an ISO date string to "April 13, 2026". Returns "N/A" for nullish. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Fee ──────────────────────────────────────────────────────────────────────

const FEE_TYPE_SUFFIX: Record<string, string> = {
  HOURLY: '/hr',
  MONTHLY: '/month',
  PER_SESSION: '/session',
}

/** Formats a dollar-denominated fee amount with its type suffix. */
export function formatFeeAmount(
  amount: number | null | undefined,
  feeType: string | null | undefined,
): string {
  if (amount == null) return 'N/A'
  const suffix = feeType ? (FEE_TYPE_SUFFIX[feeType] ?? '') : ''
  return `$${amount}${suffix}`
}

export function formatFeeType(feeType: string | null | undefined): string {
  if (!feeType) return 'N/A'
  return { HOURLY: 'Hourly', MONTHLY: 'Monthly', PER_SESSION: 'Per Session' }[feeType] ?? feeType
}

// ─── Enum label resolution ────────────────────────────────────────────────────

/**
 * Best-effort label for stored API enum codes (`SCREAMING_SNAKE_CASE`).
 * Leaves credentials, acronyms, and normal phrases (e.g. LCMFT, LMFT, mixed case) unchanged.
 */
export function humanizeScreamingSnakeCase(raw: string): string {
  const s = raw.trim()
  if (!s) return s
  if (!s.includes('_')) return s
  return s
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Resolves an enum value to its human-readable label from a list of options.
 * If there is no match, applies {@link humanizeScreamingSnakeCase} when the value looks
 * like an enum code; otherwise returns the value unchanged.
 */
export function resolveOptionLabel(
  value: string | null | undefined,
  options: SelectOption[],
): string {
  if (!value) return 'N/A'
  return options.find((o) => o.value === value)?.label ?? humanizeScreamingSnakeCase(value)
}

/**
 * Resolves an array of enum values to human-readable labels.
 * Values without a matching option use {@link humanizeScreamingSnakeCase} when they look
 * like enum codes; otherwise the raw value is kept.
 */
export function resolveOptionLabels(values: string[], options: SelectOption[]): string[] {
  return values.map(
    (v) => options.find((o) => o.value === v)?.label ?? humanizeScreamingSnakeCase(v),
  )
}

// ─── Supervision format ───────────────────────────────────────────────────────

const SUPERVISION_FORMAT_LABELS: Record<string, string> = {
  VIRTUAL: 'Virtual',
  IN_PERSON: 'In-Person',
  HYBRID: 'Hybrid',
}

export function formatSupervisionFormat(fmt: string | null | undefined): string {
  if (!fmt) return 'N/A'
  return SUPERVISION_FORMAT_LABELS[fmt] ?? fmt
}

// ─── Availability ─────────────────────────────────────────────────────────────

const AVAILABILITY_LABELS: Record<string, string> = {
  FLEXIBLE: 'Flexible',
  WEEKDAYS: 'Weekdays',
  EVENINGS: 'Evenings',
  WEEKENDS: 'Weekends',
  BY_APPOINTMENT: 'By Appointment',
}

export function formatAvailability(availability: string | null | undefined): string {
  if (!availability) return 'N/A'
  return AVAILABILITY_LABELS[availability] ?? availability
}

// ─── Type of supervisor (GET /supervision/options `supervisorType`; same list as signup) ─

/** Stored values from the previous counseling-focused option list and older API shapes. */
const LEGACY_SUPERVISOR_TYPE_LABELS: Record<string, string> = {
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
  Collaborating_Physician: 'Collaborating Physician',
  Preceptor: 'Preceptor',
  Supervising_Physician: 'Supervising Physician',
  Supervisor: 'Supervisor',
}

/** When options are still loading or the API adds a code not yet in the list — no parallel enum map. */
function humanizeSupervisorTypeFallback(raw: string): string {
  return raw
    .split(/[_ ]/)
    .filter(Boolean)
    .map((part) => {
      // Keep short ALL-CAPS acronyms (e.g. LPC, ACS) unchanged
      if (part.length >= 2 && part.length <= 6 && part === part.toUpperCase()) {
        return part
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .join(' ')
}

/** Normalizes API values that may be a single string or `String[]` (Prisma JSON / multipart). */
export function coerceStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }
  return []
}

function resolveOneSupervisorTypeLabel(key: string, options: SelectOption[]): string {
  const fromOptions = options.find((o) => o.value === key)?.label
  if (fromOptions) return fromOptions
  const legacy = LEGACY_SUPERVISOR_TYPE_LABELS[key]
  if (legacy) return legacy
  return humanizeSupervisorTypeFallback(key)
}

/**
 * Resolves the display label from `useSuperviseeFormOptions().supervisorTypes` (or any matching
 * `SelectOption[]`). If there is no match, returns a best-effort humanized string (not the raw
 * code) so the UI stays readable while options load or for unknown values.
 * Accepts a single code or multiple (comma-separated in the UI).
 */
export function resolveSupervisorTypeLabel(
  value: string | string[] | null | undefined,
  options: SelectOption[],
): string {
  const keys = coerceStringList(value)
  if (keys.length === 0) return 'N/A'
  return keys.map((key) => resolveOneSupervisorTypeLabel(key, options)).join(', ')
}

const DEFAULT_SUPERVISOR_ROLE_LABEL = 'Supervisor'

/**
 * Badge / subtitle label for a supervisor's role: uses `supervisorType` when set,
 * otherwise falls back to "Supervisor" (or a custom fallback).
 */
export function formatSupervisorTypeLabel(
  supervisorType: string | null | undefined,
  options: SelectOption[] = [],
  fallback: string = DEFAULT_SUPERVISOR_ROLE_LABEL,
): string {
  const raw = typeof supervisorType === 'string' ? supervisorType.trim() : ''
  if (!raw) return fallback
  return resolveOneSupervisorTypeLabel(raw, options)
}

/** Supervisor type for mental health counselor supervisees (MHC). */
export const MHC_SUPERVISOR_TYPE = SUPERVISOR_TYPE_QUERY_MAP['mental-health-counselor']!

/** MHC supervisees track required supervision hours; PA/NP hire flows do not. */
export function requiresSupervisionHours(
  typeOfSupervisorNeeded: string | null | undefined,
): boolean {
  return (typeOfSupervisorNeeded?.trim() ?? '') === MHC_SUPERVISOR_TYPE
}

/** Positive whole numbers only — rejects 0, 01, 001, etc. */
export const SUPERVISION_HOURS_INPUT_PATTERN = /^[1-9]\d*$/

export function isValidSupervisionHoursInput(value: string): boolean {
  return SUPERVISION_HOURS_INPUT_PATTERN.test(value.trim())
}

export function parseSupervisionHoursInput(
  value: string | number | null | undefined,
): number | null {
  if (value == null) return null
  const raw = String(value).trim()
  if (!isValidSupervisionHoursInput(raw)) return null
  return parseInt(raw, 10)
}

export function formatSupervisionHours(value: number | null | undefined): string {
  if (value == null) return ''
  return `${value} hour${value === 1 ? '' : 's'}`
}

/** Human-readable state list for “looking in” using US state option labels when available. */
export function formatLookingInStatesLabel(
  value: string | string[] | null | undefined,
  stateOptions: SelectOption[],
): string {
  const keys = coerceStringList(value)
  if (keys.length === 0) return '—'
  return keys.map((k) => resolveOptionLabel(k, stateOptions)).join(', ')
}

// ─── Budget range ─────────────────────────────────────────────────────────────

const BUDGET_TYPE_SUFFIX: Record<string, string> = {
  PER_SESSION: '/session',
  MONTHLY: '/month',
}

export function formatBudgetRange(
  start: number | null | undefined,
  end: number | null | undefined,
  type: string | null | undefined,
): string {
  if (start == null && end == null) return 'N/A'
  const suffix = type ? (BUDGET_TYPE_SUFFIX[type] ?? '') : ''
  if (start != null && end != null) return `$${start}–$${end}${suffix}`
  if (start != null) return `From $${start}${suffix}`
  return `Up to $${end}${suffix}`
}

// ─── How soon looking ─────────────────────────────────────────────────────────

const HOW_SOON_LABELS: Record<string, string> = {
  IMMEDIATELY: 'As soon as possible',
  WITHIN_2_WEEKS: 'Within 2 weeks',
  WITHIN_1_MONTH: 'Within 1 month',
  WITHIN_2_MONTHS: 'Within 3 months',
  WITHIN_6_MONTHS: 'Just exploring',
  CUSTOM_DATE: 'Custom date',
}

const HOW_SOON_LABELS_COMPACT: Record<string, string> = {
  IMMEDIATELY: 'ASAP',
  WITHIN_2_WEEKS: 'Within 2 weeks',
  WITHIN_1_MONTH: 'Within 1 month',
  WITHIN_2_MONTHS: 'Within 3 months',
  WITHIN_6_MONTHS: 'Exploring',
  CUSTOM_DATE: 'Custom date',
}

/** Formats supervisee howSoonLooking (+ optional custom date). */
export function formatHowSoonLooking(
  value: string | null | undefined,
  lookingDate?: string | null | undefined,
  options?: { compact?: boolean; emptyFallback?: string },
): string {
  const emptyFallback = options?.emptyFallback ?? 'N/A'
  if (!value) return emptyFallback

  if (value === 'CUSTOM_DATE') {
    if (!lookingDate) return options?.compact ? 'Custom date' : 'Custom date'
    return new Date(lookingDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const labels = options?.compact ? HOW_SOON_LABELS_COMPACT : HOW_SOON_LABELS
  return labels[value] ?? value
}

// ─── Phone ────────────────────────────────────────────────────────────────────

/** Formats a raw phone string as (XXX) XXX-XXXX. Returns "N/A" for nullish. */
export function formatContactNumber(value: string | null | undefined): string {
  if (!value?.trim()) return 'N/A'
  const formatted = formatUSPhoneForDisplay(value)
  return formatted || value
}

// ─── Initials ─────────────────────────────────────────────────────────────────

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
