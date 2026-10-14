/**
 * Billing week of an hourly hire (Mon–Sun, US Eastern):
 * - OPEN: the supervisor can log sessions until the Monday 11:59 PM ET deadline
 * - IN_REVIEW: the supervisee approves or disputes within 3 days
 * - DISPUTED: frozen until Gotham support resolves it
 * - APPROVED: by the supervisee, automatically, or by support
 * - SETTLED: supervisor paid, unused prepay refunded
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
}

export interface BillingWeek {
  id: string
  /** Monday, YYYY-MM-DD (Eastern) */
  startDate: string
  /** Sunday, YYYY-MM-DD (Eastern) */
  endDate: string
  status: BillingWeekStatus
  prepayStatus: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELED'
  weeklyCapMinutes: number
  loggedMinutes: number
  logDeadlineAt: string
  reviewEndsAt: string
  approvedMinutes: number | null
  approvedAt: string | null
  approvedBy: BillingWeekApprovedBy | null
  disputedAt: string | null
  disputeReason: string | null
  canEditSessions: boolean
  canReview: boolean
  sessions: HireSession[]
}

/** GET /supervision/hires/:hireId/billing-weeks */
export interface HireBillingWeeks {
  role: 'supervisor' | 'supervisee'
  terms: {
    /** YYYY-MM-DD */
    startDate: string
    hourlyRateCents: number
    weeklyCapMinutes: number
    totalHours: number | null
  }
  progress: {
    loggedMinutes: number
    approvedMinutes: number
    totalMinutes: number | null
  }
  canLog: boolean
  /** Dates (YYYY-MM-DD, Eastern) the supervisor can log for right now. */
  loggable: { from: string; to: string } | null
  /** Newest first */
  weeks: BillingWeek[]
}

export interface HireSessionInput {
  sessionDate: string
  durationMinutes: number
  notes: string
}
