'use client'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useSupervisorReviews } from '@/lib/hooks'
import type { Review } from '@/types/review'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(fullName: string | null): string {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}

function computeOverallRating(reviews: Review[]): number {
  if (!reviews.length) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function computeStarBreakdown(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0]
  for (const r of reviews) {
    const idx = Math.min(Math.max(Math.round(r.rating), 1), 5) - 1
    counts[idx]++
  }
  const max = Math.max(...counts, 1)
  return [5, 4, 3, 2, 1].map((star) => ({
    label: `${star} Star${star !== 1 ? 's' : ''}`,
    count: counts[star - 1],
    pct: Math.round((counts[star - 1] / max) * 100),
  }))
}

// ─── Small shared UI pieces ───────────────────────────────────────────────────

function StarIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1l1.5 3.1 3.5.5-2.5 2.4.6 3.4L7 8.8l-3.1 1.6.6-3.4L2 4.6l3.5-.5L7 1z"
        fill={filled ? '#F59E0B' : '#E5E7EB'}
      />
    </svg>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const filledStars = Math.round(review.rating)
  const reviewerName = review.supervisee.fullName ?? review.supervisee.email
  const initials = getInitials(review.supervisee.fullName)

  return (
    <div className="flex min-w-0 flex-col gap-2 border-t border-[#F3F4F6] py-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-xs font-semibold text-[#0369A1]">
          {initials}
        </div>

        <div className="min-w-0 flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[#374151]">{reviewerName}</span>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < filledStars} size={11} />
              ))}
            </div>
            <span className="text-xs text-[#374151]">{review.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-[#9CA3AF]">
          <span>{timeAgo(review.createdAt)}</span>
        </div>
      </div>

      {review.comment && (
        <p className="min-w-0 max-w-full break-words text-sm leading-[1.6] whitespace-pre-wrap text-[#374151] [overflow-wrap:anywhere]">
          {review.comment}
        </p>
      )}
    </div>
  )
}

// ─── Skeleton loading ─────────────────────────────────────────────────────────

function ReviewsSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 border-t border-[#F3F4F6] py-5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full max-w-[500px]" />
          <Skeleton className="h-4 w-3/4 max-w-[380px]" />
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SupervisorProfileReviewsProps {
  supervisorId: string
}

export function SupervisorProfileReviews({ supervisorId }: SupervisorProfileReviewsProps) {
  const [showAll, setShowAll] = useState(false)
  const { data, isLoading, isError } = useSupervisorReviews(supervisorId)

  const reviews = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  const overallRating = computeOverallRating(reviews)
  const starBreakdown = computeStarBreakdown(reviews)
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <section className="py-8">
      <h2 className="mb-1 text-base font-semibold text-[#181818]">Reviews</h2>

      {isLoading && (
        <>
          <p className="mb-5 text-sm text-[#6B7280]">Loading reviews…</p>
          <ReviewsSkeleton />
        </>
      )}

      {isError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          <AlertCircle className="size-4 shrink-0" />
          <span>Could not load reviews. Please try again later.</span>
        </div>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <p className="mt-4 text-sm text-[#6B7280]">No reviews yet.</p>
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <>
          <p className="mb-5 text-sm text-[#6B7280]">
            {totalCount} review{totalCount !== 1 ? 's' : ''} for this Service
          </p>

          {/* Rating overview */}
          <div className="mb-2 flex items-start gap-8">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="text-4xl font-bold text-[#181818]">{overallRating.toFixed(1)}</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} filled={i < Math.round(overallRating)} />
                ))}
              </div>
              <span className="text-xs text-[#9CA3AF]">out of 5</span>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              {starBreakdown.map(({ label, count, pct }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="w-[52px] text-right text-xs text-[#6B7280]">{label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-[#E5E7EB]">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: count < 1 ? '#E5E7EB' : '#006D36',
                      }}
                    />
                  </div>
                  <span className="w-7 text-xs text-[#6B7280]">({count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual reviews */}
          <div>
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Show more */}
          {!showAll && reviews.length > 3 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="rounded-[7px] border-[1.5px] border-[#E5E7EB] px-5 py-2 text-sm text-[#374151] transition-colors hover:bg-gray-50"
              >
                Show More Reviews
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
