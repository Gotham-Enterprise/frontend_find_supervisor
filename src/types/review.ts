export interface ReviewUser {
  id: string
  fullName: string | null
  email: string
  profilePhotoUrl?: string | null
}

export interface ReviewHire {
  id: string
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export interface Review {
  id: string
  supervisorId: string
  superviseeId: string
  hireId: string | null
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  supervisor: ReviewUser
  supervisee: ReviewUser
  hire?: ReviewHire | null
}

export interface ReviewListResponse {
  items: Review[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export interface CreateReviewPayload {
  hireId: string
  rating: number
  comment: string
}

export interface UpdateReviewPayload {
  rating?: number
  comment?: string
}

export interface GetReviewsParams {
  supervisorId?: string
  superviseeId?: string
  hireId?: string
  page?: number
  limit?: number
}
