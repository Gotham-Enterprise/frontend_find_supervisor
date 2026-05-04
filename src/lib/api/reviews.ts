import type { ApiResponse } from '@/types/api'
import type {
  CreateReviewPayload,
  GetReviewsParams,
  Review,
  ReviewListResponse,
  UpdateReviewPayload,
} from '@/types/review'

import { apiClient } from './client'

/** POST /supervision/reviews — supervisee submits a review for a completed hire. */
export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await apiClient.post<ApiResponse<Review>>('/supervision/reviews', payload)
  return data.data
}

/** GET /supervision/reviews — paginated review list.
 *  - No params → returns reviews for the authenticated user (scoped by role on backend).
 *  - supervisorId → public/supervisee detail page reviews for that supervisor.
 *  - limit=0 → backend returns all records.
 */
export async function getReviews(params: GetReviewsParams = {}): Promise<ReviewListResponse> {
  const { data } = await apiClient.get<ApiResponse<ReviewListResponse>>('/supervision/reviews', {
    params,
  })
  return data.data
}

/** PATCH /supervision/reviews/:reviewId — supervisee updates an existing review. */
export async function updateReview(
  reviewId: string,
  payload: UpdateReviewPayload,
): Promise<Review> {
  const { data } = await apiClient.patch<ApiResponse<Review>>(
    `/supervision/reviews/${reviewId}`,
    payload,
  )
  return data.data
}
