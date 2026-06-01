export type ConnectionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELED'

export type ConnectionSource = 'REGISTERED_USER' | 'PUBLIC'

/** Sparse user shape returned nested inside connection request items. */
export interface ConnectionUser {
  id: string
  fullName: string | null
  email: string
  role: string
  profilePhotoUrl: string | null
  city: string | null
  state: string | null
  supervisorProfile: {
    supervisorType?: string | null
    occupation?: string | null
    specialty?: string | null
    licenseType?: string | null
    availability?: string | null
  } | null
  superviseeProfile: {
    occupation?: string | null
    specialty?: string | null
    howSoonLooking?: string | null
  } | null
}

/** A connection request as returned by the API list endpoints. */
export interface ConnectionRequest {
  id: string
  requesterId: string | null
  receiverId: string
  source: ConnectionSource
  requesterName: string
  requesterEmail: string
  requesterPhone: string | null
  requesterAddress: string | null
  message: string
  status: ConnectionStatus
  approvedAt: string | null
  declinedAt: string | null
  declineReason: string | null
  canRequestAgainAt: string | null
  createdAt: string
  updatedAt: string

  /** Present on received-request list items (the supervisor who sent the request). */
  requester?: ConnectionUser | null
  /** Present on sent-request list items (the supervisee who received the request). */
  receiver?: ConnectionUser | null
  /**
   * Present on received-request list items when status is APPROVED.
   * The ID of the SupervisionConversation between this supervisor and supervisee.
   */
  conversationId?: string | null
}

export type CheckAvailabilityReason =
  | 'PENDING_REQUEST_EXISTS'
  | 'ALREADY_APPROVED'
  | 'COOLDOWN_ACTIVE'
  | null

/** Response from GET /connections/check */
export interface CheckAvailabilityResult {
  canRequest: boolean
  reason: CheckAvailabilityReason
  canRequestAgainAt: string | null
}

export interface PaginationMeta {
  page: number
  limit: number
  totalPages: number
  totalCount: number
  currentPageTotalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ConnectionListResult {
  items: ConnectionRequest[]
  meta: PaginationMeta
}

/** Response from PATCH /connections/:id/approve */
export interface ApproveConnectionResult {
  connectionId: string
  status: 'APPROVED'
  conversationId: string | null
}
