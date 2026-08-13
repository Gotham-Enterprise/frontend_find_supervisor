import type { CheckAvailabilityReason } from '@/types/connections'
import type { AgreementStage, HireStatus } from '@/types/hire'

// ─── Connection status ─────────────────────────────────────────────────────────
// Driven by the CheckAvailabilityResult returned by GET /connections/check.
// reason === null + canRequest === true  → no connection exists yet.

export function isAcceptedConnectionStatus(
  reason: CheckAvailabilityReason | null | undefined,
): boolean {
  return reason === 'ALREADY_APPROVED'
}

export function isPendingConnectionStatus(
  reason: CheckAvailabilityReason | null | undefined,
): boolean {
  return reason === 'PENDING_REQUEST_EXISTS'
}

export function getConnectionStatusLabel(
  reason: CheckAvailabilityReason | null | undefined,
): string {
  if (reason === 'ALREADY_APPROVED') return 'Connected'
  if (reason === 'PENDING_REQUEST_EXISTS') return 'Connection Pending'
  if (reason === 'COOLDOWN_ACTIVE') return 'Connection Declined'
  return 'Not Connected'
}

/** Tailwind classes to apply on a `<Badge>` for the current connection state. */
export function getConnectionBadgeClassName(
  reason: CheckAvailabilityReason | null | undefined,
): string {
  if (reason === 'ALREADY_APPROVED')
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
  if (reason === 'PENDING_REQUEST_EXISTS')
    return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'
  if (reason === 'COOLDOWN_ACTIVE') return 'bg-red-100 text-red-600 border-red-200 hover:bg-red-100'
  // Not connected
  return 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
}

// ─── Hire status ───────────────────────────────────────────────────────────────
// Driven by the HireStatus enum: PENDING | ACCEPTED | ACTIVE | COMPLETED |
// CANCELED | REJECTED | REVIEWED

export function isApprovedHireStatus(status: HireStatus | string | undefined | null): boolean {
  return status === 'ACCEPTED' || status === 'ACTIVE'
}

export function getHireStatusLabel(status: HireStatus | string | undefined | null): string {
  switch (status) {
    case 'ACCEPTED':
    case 'ACTIVE':
      return 'Hired'
    case 'PENDING':
      return 'Hire Pending'
    case 'REVIEWED':
      return 'Under Review'
    case 'COMPLETED':
      return 'Completed'
    case 'REJECTED':
      return 'Hire Declined'
    case 'CANCELED':
      return 'Hire Cancelled'
    default:
      return 'Not Hired'
  }
}

/** Tailwind classes to apply on a `<Badge>` for the current hire state. */
export function getHireBadgeClassName(status: HireStatus | string | undefined | null): string {
  switch (status) {
    case 'ACCEPTED':
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'
    case 'REVIEWED':
      return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'
    case 'COMPLETED':
      return 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-200'
    case 'REJECTED':
      return 'bg-red-100 text-red-600 border-red-200 hover:bg-red-100'
    case 'CANCELED':
      return 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
    default:
      return 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-100'
  }
}

// ─── Agreement stage ───────────────────────────────────────────────────────────
// Derived from hire fields — there is no AGREEMENT_* HireStatus. The agreement
// sits between ACCEPTED and ACTIVE: the supervisor proposes + signs, the
// supervisee countersigns, and agreedAt records when the last signature landed.

export function getAgreementStage(hire: {
  agreedAt: string | null
  agreement?: { superviseeSignedAt: string | null } | null
}): AgreementStage {
  if (hire.agreedAt || hire.agreement?.superviseeSignedAt) return 'SIGNED'
  if (hire.agreement) return 'AWAITING_SIGNATURE'
  return 'NOT_SENT'
}

export function getAgreementStageLabel(stage: AgreementStage): string {
  switch (stage) {
    case 'SIGNED':
      return 'Agreement Signed'
    case 'AWAITING_SIGNATURE':
      return 'Awaiting Signature'
    default:
      return 'No Agreement'
  }
}

/** Tailwind classes to apply on a `<Badge>` for the current agreement stage. */
export function getAgreementBadgeClassName(stage: AgreementStage): string {
  switch (stage) {
    case 'SIGNED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
    case 'AWAITING_SIGNATURE':
      return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
  }
}

/** Completion requires an accepted/active hire whose agreement is fully signed. */
export function canMarkHireCompleted(hire: {
  status: HireStatus | string
  agreedAt: string | null
  agreement?: { superviseeSignedAt: string | null } | null
}): boolean {
  return isApprovedHireStatus(hire.status) && getAgreementStage(hire) === 'SIGNED'
}

// ─── Combined messaging access ─────────────────────────────────────────────────

/**
 * True when either the connection request was approved OR the hire relationship
 * is active — either state unlocks messaging between the two users.
 */
export function canMessageBetweenUsers({
  connectionReason,
  hireStatus,
}: {
  connectionReason: CheckAvailabilityReason | null | undefined
  hireStatus: HireStatus | string | undefined | null
}): boolean {
  return isAcceptedConnectionStatus(connectionReason) || isApprovedHireStatus(hireStatus)
}
