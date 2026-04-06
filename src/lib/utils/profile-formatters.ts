import type { SelectOption } from '@/lib/api/options'

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
 * Resolves an enum value to its human-readable label from a list of options.
 * Falls back to the raw value if no matching option is found.
 */
export function resolveOptionLabel(
  value: string | null | undefined,
  options: SelectOption[],
): string {
  if (!value) return 'N/A'
  return options.find((o) => o.value === value)?.label ?? value
}

/**
 * Resolves an array of enum values to human-readable labels.
 * Values without a matching option are returned as-is.
 */
export function resolveOptionLabels(values: string[], options: SelectOption[]): string[] {
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v)
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
