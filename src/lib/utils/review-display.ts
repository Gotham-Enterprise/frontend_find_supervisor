import { formatCityStateLine } from '@/lib/utils/profile-formatters'
import type { ReviewUser } from '@/types/review'

/** Occupation (title) and city/state for a review author. */
export function formatReviewerTitleCityState(user: ReviewUser): string | null {
  const parts: string[] = []
  const occ = user.occupation?.name?.trim()
  if (occ) parts.push(occ)
  const loc = formatCityStateLine(user.city, user.state)
  if (loc) parts.push(loc)
  return parts.length ? parts.join(' · ') : null
}
