'use client'

import { useState } from 'react'

/** Reviews section — uses dummy data until the review API is available. */

interface Review {
  id: string
  reviewer: string
  initials: string
  rating: number
  paidAmount: number
  timeAgo: string
  text: string
}

const DUMMY_REVIEWS: Review[] = [
  {
    id: '1',
    reviewer: 'James Healey',
    initials: 'JH',
    rating: 4.8,
    paidAmount: 120,
    timeAgo: '2 weeks ago',
    text: "I hired this supervisor for clinical support after my licensure exam. They designed a personalized supervision plan that balanced case consultation with professional development. Their guidance made me feel confident throughout the process. I'm now successfully working with my own clients.",
  },
  {
    id: '2',
    reviewer: 'Maria Gonzalez',
    initials: 'MG',
    rating: 5.0,
    paidAmount: 100,
    timeAgo: '1 month ago',
    text: 'Exceptional supervisor. Their structured approach to case conceptualization helped me grow tremendously as a clinician. Every session felt purposeful and I always left with clear action items and renewed confidence in my practice.',
  },
  {
    id: '3',
    reviewer: 'David Kim',
    initials: 'DK',
    rating: 4.8,
    paidAmount: 100,
    timeAgo: '6 weeks ago',
    text: 'Very knowledgeable and supportive. I appreciated the balance between challenge and encouragement. They helped me think more critically about my cases and have been an invaluable resource throughout my post-grad licensure journey.',
  },
  {
    id: '4',
    reviewer: 'Priya Nair',
    initials: 'PN',
    rating: 5.0,
    paidAmount: 120,
    timeAgo: '2 months ago',
    text: 'As someone newer to the field, I was nervous about supervision but they immediately put me at ease. Their depth of experience and warm communication style made every session feel safe and growth-oriented. Highly recommend.',
  },
  {
    id: '5',
    reviewer: 'Sarah Thompson',
    initials: 'ST',
    rating: 4.8,
    paidAmount: 100,
    timeAgo: '3 months ago',
    text: 'I completed my required supervision hours with this supervisor and could not have chosen better. Their feedback is specific, actionable, and always delivered with genuine care for my development as a practitioner.',
  },
]

const STAR_BREAKDOWN = [
  { label: '5 Stars', count: 100, pct: 80 },
  { label: '4 Stars', count: 46, pct: 45 },
  { label: '3 Stars', count: 2, pct: 12 },
  { label: '2 Stars', count: 2, pct: 4 },
  { label: '1 Star', count: 1, pct: 2 },
]

const OVERALL_RATING = 4.8
const TOTAL_REVIEWS = 518

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

  return (
    <div className="flex flex-col gap-2 border-t border-[#F3F4F6] py-5">
      {/* Reviewer header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-xs font-semibold text-[#0369A1]">
          {review.initials}
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[#374151]">{review.reviewer}</span>
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
          <span>Pay ${review.paidAmount}</span>
          <span>·</span>
          <span>{review.timeAgo}</span>
          <div className="flex h-6 items-center rounded border border-[#BBF7D0] bg-[#F0FDF4] px-2.5">
            <span className="text-[11px] font-medium text-[#006D36]">Helpful</span>
          </div>
        </div>
      </div>

      {/* Review text */}
      <p className="max-w-[760px] text-sm leading-[1.6] text-[#374151]">{review.text}</p>
    </div>
  )
}

export function SupervisorProfileReviews() {
  const [showAll, setShowAll] = useState(false)
  const visibleReviews = showAll ? DUMMY_REVIEWS : DUMMY_REVIEWS.slice(0, 3)

  return (
    <section className="py-8">
      <h2 className="mb-1 text-base font-semibold text-[#181818]">Reviews</h2>
      <p className="mb-5 text-sm text-[#6B7280]">{TOTAL_REVIEWS} reviews for this Service</p>

      {/* Rating overview */}
      <div className="mb-2 flex items-start gap-8">
        {/* Big score */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="text-4xl font-bold text-[#181818]">{OVERALL_RATING}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} filled={i < Math.round(OVERALL_RATING)} />
            ))}
          </div>
          <span className="text-xs text-[#9CA3AF]">out of 5</span>
        </div>

        {/* Breakdown bars */}
        <div className="flex flex-1 flex-col gap-1.5">
          {STAR_BREAKDOWN.map(({ label, count, pct }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="w-[52px] text-right text-xs text-[#6B7280]">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded bg-[#E5E7EB]">
                <div
                  className="h-full rounded bg-[#006D36]"
                  style={{ width: `${pct}%`, backgroundColor: count < 3 ? '#E5E7EB' : '#006D36' }}
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
      {!showAll && DUMMY_REVIEWS.length > 3 && (
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
    </section>
  )
}
