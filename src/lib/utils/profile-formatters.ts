import type { SelectOption } from '@/lib/api/options'
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
 * Best-effort label for stored API enum codes (`SCREAMING_SNAKE_CASE` or long `ALL CAPS`).
 * Leaves normal phrases (mixed case, spaces, short acronyms like ACT) unchanged.
 */
export function humanizeScreamingSnakeCase(raw: string): string {
  const s = raw.trim()
  if (!s) return s
  const hasUnderscore = s.includes('_')
  const allCapsToken = /^[A-Z0-9]+$/.test(s)
  const isLikelyEnumCode = hasUnderscore || (allCapsToken && s.length >= 5)
  if (!isLikelyEnumCode) return s
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

/** When options are still loading or the API adds a code not yet in the list — no parallel enum map. */
function humanizeSupervisorTypeFallback(raw: string): string {
  return raw
    .split('_')
    .map((part) => {
      if (part.length >= 2 && part.length <= 6 && part === part.toUpperCase()) {
        return part
      }
      return part.charAt(0) + part.slice(1).toLowerCase()
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
