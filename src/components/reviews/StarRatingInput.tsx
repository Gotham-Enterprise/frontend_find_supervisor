'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

interface StarRatingInputProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: number
}

function StarIcon({ filled, size = 28 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2l2.4 5 5.6.8-4 3.9.9 5.5L12 14.8l-4.9 2.4.9-5.5-4-3.9 5.6-.8L12 2z"
        fill={filled ? '#F59E0B' : '#E5E7EB'}
        stroke={filled ? '#F59E0B' : '#D1D5DB'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  size = 28,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0)

  const active = hovered || value

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Star rating"
      onMouseLeave={() => setHovered(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            className={cn(
              'rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              !disabled && 'hover:scale-110 cursor-pointer',
              disabled && 'cursor-default opacity-60',
            )}
          >
            <StarIcon filled={star <= active} size={size} />
          </button>
        )
      })}
    </div>
  )
}
