export type PreferredFormat = 'IN_PERSON' | 'VIRTUAL' | 'HYBRID'
export type PreferredAvailability =
  | 'FLEXIBLE'
  | 'WEEKDAYS'
  | 'EVENINGS'
  | 'WEEKENDS'
  | 'BY_APPOINTMENT'
export type BudgetRangeType = 'PER_SESSION' | 'MONTHLY'
export type HireStatus = 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED' | 'REJECTED'

// ─── Nested user shape returned inside hire list items ─────────────────────────

export interface HireUser {
  id: string
  email: string
  userName?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName: string | null
  contactNumber?: string | null
  city: string | null
  state: string | null
  zipcode?: string | null
  profilePhotoUrl?: string | null
  stateOfLicensure: string[]
  status?: string | null
  occupation: { id: number; name: string } | null
  specialty: { id: number; name: string } | null
}

// ─── POST /api/supervision/hires ──────────────────────────────────────────────

/** POST /api/supervision/hires — exact backend contract from the validator. */
export interface HireSupervisorPayload {
  supervisorId: string
  preferredFormat: PreferredFormat
  preferredAvailability: PreferredAvailability
  typeOfSupervisorNeeded: string
  stateTheyAreLookingIn: string
  preferredStartDate: string // ISO date string
  budgetRangeType: BudgetRangeType
  budgetRangeStart: number
  /** Response body for a newly created hire. */
  budgetRangeEnd: number
  introMessage: string
  goals: string
}

export interface HireRecord {
  id: string
  superviseeId: string
  supervisorId: string
  preferredFormat: PreferredFormat | null
  preferredAvailability: PreferredAvailability | null
  typeOfSupervisorNeeded: string | null
  stateTheyAreLookingIn: string | null
  preferredStartDate: string | null
  budgetRangeType: BudgetRangeType | null
  budgetRangeStart: number | null
  budgetRangeEnd: number | null
  introMessage: string | null
}
// ─── GET /api/supervision/hires ───────────────────────────────────────────────

/**
 * A single row from the hire list.
 * Includes both the supervisee request snapshot and the supervisor info snapshot
 * captured at hire time, plus the nested supervisor/supervisee user objects.
 */
export interface HireListItem {
  id: string
  superviseeId: string
  supervisorId: string

  // Supervisee request snapshot
  preferredFormat: PreferredFormat | null
  preferredAvailability: PreferredAvailability | null
  typeOfSupervisorNeeded: string | null
  stateTheyAreLookingIn: string | null
  preferredStartDate: string | null
  budgetRangeType: BudgetRangeType | null
  budgetRangeStart: number | null
  budgetRangeEnd: number | null
  introMessage: string | null
  goals: string | null

  // Supervisor info snapshot at time of request
  supervisorProfession: string | null
  supervisorLicenseType: string | null
  supervisorStateLicense: string[]
  supervisorFormat: PreferredFormat | null
  supervisorAvailability: PreferredAvailability | null
  supervisorFeeType: string | null
  supervisorFeeAmount: number | null

  // Hire lifecycle
  startDate: string | null
  endDate: string | null
  supervisionMonths: number | null
  monthlyAmount: string | null
  transactionFeePct: string | null
  status: HireStatus
  agreedAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  completedAt: string | null
  canceledAt: string | null
  refundHoldStatus: string | null
  releaseAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string

  // Nested relations
  supervisor: HireUser
  supervisee: HireUser
}

/** Paginated response shape from formatResponse() in pagination_utils.js. */
export interface HireListResponse {
  items: HireListItem[]
  totalCount: number
  currentPage: number
  totalPages: number
}
