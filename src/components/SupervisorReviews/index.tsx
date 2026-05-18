'use client'

import { AlertCircle, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useSupervisorDashboardReviews } from '@/lib/hooks/useReviews'
import { formatReviewerTitleCityState } from '@/lib/utils/review-display'
import type { Review } from '@/types/review'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}

function computeAverageRating(reviews: Review[]): number {
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
    star,
    count: counts[star - 1],
    pct: Math.round((counts[star - 1] / max) * 100),
  }))
}

// ─── Star display (read-only) ─────────────────────────────────────────────────

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-px" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M7 1l1.5 3.1 3.5.5-2.5 2.4.6 3.4L7 8.8l-3.1 1.6.6-3.4L2 4.6l3.5-.5L7 1z"
            fill={i < filled ? '#F59E0B' : '#E5E7EB'}
          />
        </svg>
      ))}
    </div>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  reviews: Review[]
  totalCount: number
}

function SummaryCard({ reviews, totalCount }: SummaryCardProps) {
  const avg = computeAverageRating(reviews)
  const breakdown = computeStarBreakdown(reviews)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          {/* Big number */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <span className="text-5xl font-bold text-foreground">{avg.toFixed(1)}</span>
            <StarDisplay rating={avg} size={18} />
            <span className="mt-1 text-xs text-muted-foreground">
              {totalCount} review{totalCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Bar chart */}
          <div className="flex flex-1 flex-col gap-2">
            {breakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2.5">
                <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                  {star} star{star !== 1 ? 's' : ''}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Individual review card ────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const reviewerName = review.supervisee.fullName ?? review.supervisee.email
  const reviewerMeta = formatReviewerTitleCityState(review.supervisee)
  const hireInfo = review.hire
    ? review.hire.startDate
      ? `Supervision started ${new Date(review.hire.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
      : null
    : null

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex min-w-0 flex-col gap-3">
          {/* Reviewer row */}
          <div className="flex min-w-0 items-start gap-3">
            <UserAvatar
              src={review.supervisee.profilePhotoUrl}
              name={reviewerName}
              size="sm"
              className="shrink-0"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-foreground">{reviewerName}</span>
              {reviewerMeta && (
                <span className="truncate text-xs text-muted-foreground">{reviewerMeta}</span>
              )}
              {hireInfo && <span className="text-xs text-muted-foreground">{hireInfo}</span>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <StarDisplay rating={review.rating} size={13} />
                <span className="text-xs font-medium text-foreground">
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</span>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="min-w-0 max-w-full break-words text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground [overflow-wrap:anywhere]">
              {review.comment}
            </p>
          )}

          {/* Updated note */}
          {review.updatedAt !== review.createdAt && (
            <p className="text-xs text-muted-foreground/70">Edited {timeAgo(review.updatedAt)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton loading ──────────────────────────────────────────────────────────

function ReviewsSkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-1 h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-3/4 max-w-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-1 flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-2 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  isFetching: boolean
}

function Pagination({ currentPage, totalPages, onPrev, onNext, isFetching }: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentPage <= 1 || isFetching}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage >= totalPages || isFetching}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Star className="size-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No reviews yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Reviews from your supervisees will appear here once they submit feedback.
        </p>
      </div>
    </div>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 py-12 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Failed to load reviews</p>
        <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

const PAGE_LIMIT = 10

export function SupervisorReviewsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching, refetch } = useSupervisorDashboardReviews(
    page,
    PAGE_LIMIT,
  )

  const reviews = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View feedback and ratings from your supervisees.
        </p>
      </div>

      {/* Loading: summary skeleton */}
      {isLoading && (
        <>
          <SummaryCardSkeleton />
          <ReviewsSkeletonList />
        </>
      )}

      {/* Error */}
      {isError && !isLoading && <ErrorState onRetry={() => void refetch()} />}

      {/* Success — empty */}
      {!isLoading && !isError && reviews.length === 0 && <EmptyState />}

      {/* Success — has reviews */}
      {!isLoading && !isError && reviews.length > 0 && (
        <>
          <SummaryCard reviews={reviews} totalCount={totalCount} />

          <div className="flex flex-col gap-3">
            {isFetching && !isLoading && <p className="text-xs text-muted-foreground">Updating…</p>}
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
              isFetching={isFetching}
            />
          )}
        </>
      )}
    </div>
  )
}
