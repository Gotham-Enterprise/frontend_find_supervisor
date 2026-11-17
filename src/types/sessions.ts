/**
 * Billing week of an hourly hire (Sat–Fri, US Eastern; sessions are logged
 * Mon–Fri, and weekend sessions belong to the week whose Mon–Fri follows):
 * - OPEN: the supervisor can log sessions until the Friday 11:59 PM ET cutoff;
 *   right after it the supervisee's card is charged the logged hours + service fee
 * - IN_REVIEW: the supervisee approves or reports a problem Saturday–Monday 11:59 PM ET
 * - DISPUTED: frozen until Gotham support resolves it
 * - APPROVED: by the supervisee, automatically, or by support
 * - SETTLED: supervisor paid (Tuesday); if a dispute lowered the hours, the
 *   difference went back to the supervisee's card
 */
export type BillingWeekStatus = 'OPEN' | 'IN_REVIEW' | 'DISPUTED' | 'APPROVED' | 'SETTLED'

export type BillingWeekApprovedBy = 'SUPERVISEE' | 'AUTO' | 'SUPPORT'

export interface HireSession {
  id: string
  /** Eastern calendar date, YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  notes: string | null
  /** SUPPORT = late entry added by Gotham support */
  source: 'SUPERVISOR' | 'SUPPORT'
  createdAt: string
  /** Late entries only: the supervisee approves or rejects them. */
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  canRespond: boolean
  /** Late entries on a settled week are charged on their own. */
  chargeStatus: PrepayStatus | null
  /** Supervisee: what that charge is; supervisor: what they're paid for it. */
  lateChargeCents: number | null
}

export type PrepayStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'

/**
 * A supervisor's request to add a session to a closed week. Listed under the
 * week until Gotham support adds it (it then appears as a SUPPORT session) or
 * dismisses it. Never counts toward hours or money.
 */
export interface LateEntryRequest {
  id: string
  /** Eastern calendar date, YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  notes: string
  status: 'REQUESTED' | 'DISMISSED'
  createdAt: string
  resolvedAt: string | null
  /** Why support didn't add it */
  resolutionNote: string | null
}

/**
 * The week's money, as each side sees it. `prepayStatus` keeps its name but
 * describes the post-pay invoice: PENDING = not charged yet (week still open),
 * PAID = charged, FAILED = charge failed (retried daily, or Pay now),
 * CANCELED = nothing charged (no hours logged).
 */
interface BillingWeekPaymentBase {
  prepayStatus: PrepayStatus
  /** Eastern YYYY-MM-DD the invoice is charged: the Saturday after the week's Friday cutoff. */
  chargeDate: string
  /** Eastern YYYY-MM-DD the supervisor is paid: the Tuesday after the review window. */
  payoutDate: string
  paidAt: string | null
  settledAt: string | null
  /** Closed and not paid (charge failed, or no card) — Pay now is available to the supervisee. */
  unpaid: boolean
}

export interface SuperviseeWeekPayment extends BillingWeekPaymentBase {
  /** Logged hours at the rate (hours over the soft weekly max included); 0 while OPEN */
  amountCents: number
  /** Service fee on `amountCents` */
  serviceFeeCents: number
  /** Invoice total: `amountCents` + `serviceFeeCents`; 0 while OPEN */
  totalCents: number
  /** Automatic charge rounds so far (max 3; each round tries the card, then the backup card) */
  chargeAttempts: number
  failureMessage: string | null
  /** Back to the card after a problem report lowered the hours */
  refundCents: number | null
  canPayNow: boolean
}

export interface SupervisorWeekPayment extends BillingWeekPaymentBase {
  /** Paid out for the approved hours, after the platform fee */
  supervisorAmountCents: number | null
}

/** An image the supervisee attached as evidence when disputing the week. */
export interface DisputeAttachment {
  id: string
  url: string
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface BillingWeek {
  id: string
  /** Saturday, YYYY-MM-DD (Eastern) */
  startDate: string
  /** Friday, YYYY-MM-DD (Eastern) */
  endDate: string
  /** Eastern YYYY-MM-DD the invoice is charged (the Saturday after the cutoff) */
  chargeDate: string
  /** Eastern YYYY-MM-DD the supervisor is paid (the following Tuesday) */
  payoutDate: string
  status: BillingWeekStatus
  prepayStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'
  weeklyCapMinutes: number
  loggedMinutes: number
  /**
   * Minutes logged beyond the weekly max (0 when within). The max is soft:
   * such hours are logged, flagged to the supervisee on the invoice, charged
   * and paid out like any other unless the supervisee reports a problem.
   */
  overCapMinutes: number
  logDeadlineAt: string
  reviewEndsAt: string
  approvedMinutes: number | null
  approvedAt: string | null
  approvedBy: BillingWeekApprovedBy | null
  disputedAt: string | null
  disputeReason: string | null
  disputeAttachments: DisputeAttachment[]
  canEditSessions: boolean
  canReview: boolean
  payment: SuperviseeWeekPayment | SupervisorWeekPayment | null
  sessions: HireSession[]
  /** Supervisor only; empty for the supervisee */
  lateEntryRequests: LateEntryRequest[]
}

/** GET /supervision/hires/:hireId/billing-weeks */
export interface HireBillingWeeks {
  role: 'supervisor' | 'supervisee'
  /**
   * Whether the weekly invoices have a card to charge. Until the supervisee saves
   * one, no billing weeks are created and the supervisor can't log sessions.
   */
  hasPaymentCard: boolean | null
  /** Money so far: the supervisee's net payments, or the supervisor's payouts (cents). */
  totals:
    | { chargedCents: number; refundedCents: number; netPaidCents: number }
    | { paidOutCents: number }
  terms: {
    /** YYYY-MM-DD */
    startDate: string
    hourlyRateCents: number
    weeklyCapMinutes: number
    totalHours: number | null
  }
  progress: {
    /** Can exceed `totalMinutes`: the agreement's total hours are soft, like the weekly max. */
    loggedMinutes: number
    approvedMinutes: number
    totalMinutes: number | null
  }
  /**
   * False before the start date, outside an open week, without a payment card,
   * or while the supervisee's account is on hold (`superviseeOnHold`). Hours
   * used up or a full week no longer turn it false.
   */
  canLog: boolean
  /**
   * The supervisee's account is on hold: a week was still unpaid Sunday 11:59 PM
   * ET after the three charge rounds. No sessions can be logged on any of their
   * hires until that week (`holdWeekId`, which may belong to another hire) is
   * paid; messaging stays open. Lifts the moment the week is paid.
   */
  superviseeOnHold: boolean
  holdSince: string | null
  holdWeekId: string | null
  /** Dates (YYYY-MM-DD, Eastern) the supervisor can log for right now. */
  loggable: { from: string; to: string } | null
  /** Newest first */
  weeks: BillingWeek[]
}

/** GET /supervision/payments/earnings/week — one week across the supervisor's hires. */
export interface WeekSummaryDay {
  minutes: number
  /** Part of `minutes` that support added as late entries */
  lateMinutes: number
}

export interface WeekSummaryRow {
  weekId: string
  hireId: string
  superviseeName: string | null
  /** Supervisor's list page with this hire's sessions modal open */
  sessionsPath: string
  status: BillingWeekStatus
  prepayStatus: PrepayStatus
  /** Saturday … Friday */
  days: WeekSummaryDay[]
  minutes: number
  billedMinutes: number
  weeklyCapMinutes: number
  sessions: number
  grossCents: number
  platformFeeCents: number
  netCents: number
  estimated: boolean
}

export interface SupervisorWeekSummary {
  /** Saturday, YYYY-MM-DD (Eastern) */
  startDate: string
  /** Friday, YYYY-MM-DD (Eastern) */
  endDate: string
  isCurrentWeek: boolean
  hasPrevious: boolean
  hasNext: boolean
  totals: {
    minutes: number
    sessions: number
    supervisees: number
    grossCents: number
    platformFeeCents: number
    netCents: number
    estimated: boolean
  }
  rows: WeekSummaryRow[]
}

export interface HireSessionInput {
  sessionDate: string
  durationMinutes: number
  notes: string
}

/** POST /supervision/hires/:hireId/billing-weeks/:weekId/pay-now */
export interface PayNowIntent {
  status: string
  /** Absent when the week is already paid. */
  clientSecret?: string
  paymentMethodId?: string
}

/** A late entry on a settled week, charged and paid out on its own. */
export interface EarningsLateEntry {
  id: string
  /** YYYY-MM-DD */
  sessionDate: string
  durationMinutes: number
  grossCents: number
  platformFeeCents: number
  netCents: number
  chargeStatus: PrepayStatus
  paidAt: string | null
  stripeTransferId: string | null
}

/** GET /supervision/payments/earnings — a supervisor's in-app earnings across hires. */
export interface EarningsWeek {
  id: string
  hireId: string
  superviseeName: string | null
  startDate: string
  endDate: string
  status: BillingWeekStatus
  prepayStatus: PrepayStatus
  /** Logged (not rejected) minutes */
  minutes: number
  approvedMinutes: number | null
  approvedBy: BillingWeekApprovedBy | null
  paidOutCents: number
  /** Expected net payout for any week with hours that hasn't settled (an estimate while open) */
  pendingCents: number
  settledAt: string | null
  /** Minutes logged beyond the weekly max, when the API reports it (0 or absent when within). */
  overCapMinutes?: number
  // Breakdown: the paid (or, until settled, logged) hours at the rate, less the platform fee
  hourlyRateCents: number
  platformFeeBps: number
  billedMinutes: number
  grossCents: number
  platformFeeCents: number
  netCents: number
  /** True until the week settles */
  estimated: boolean
  lateEntries: EarningsLateEntry[]
  // Timeline
  /** Eastern YYYY-MM-DD the supervisee is charged (Saturday after the cutoff) */
  chargeDate: string
  /** Eastern YYYY-MM-DD the payout goes out (the following Tuesday) */
  payoutDate: string
  chargedAt: string | null
  chargeFailureMessage: string | null
  logDeadlineAt: string
  reviewEndsAt: string
  approvedAt: string | null
  disputedAt: string | null
  stripeTransferId: string | null
}

export interface EarningsSuperviseeSummary {
  hireId: string
  superviseeName: string | null
  paidOutCents: number
  pendingCents: number
  weeks: number
  /** Paid (or logged, until settled) minutes across the weeks */
  minutes: number
}

export interface EarningsMonth {
  /** YYYY-MM (US Eastern) */
  month: string
  paidOutCents: number
  minutes: number
  weeks: number
}

export interface SupervisorEarnings {
  totals: { paidOutCents: number; pendingCents: number; paidOutThisMonthCents: number }
  totalCount: number
  page: number
  limit: number
  /** Across all hires, regardless of the hire filter */
  bySupervisee: EarningsSuperviseeSummary[]
  /** Newest month first */
  monthly: EarningsMonth[]
  items: EarningsWeek[]
}
