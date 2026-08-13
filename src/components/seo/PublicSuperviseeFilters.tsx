'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { US_STATES } from '@/lib/seo/routes'

// ---------------------------------------------------------------------------
// Static filter options
// ---------------------------------------------------------------------------

const STATE_OPTIONS = Object.entries(US_STATES).map(([slug, abbr]) => ({
  label: slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
  value: abbr,
}))

const FORMAT_OPTIONS = [
  { label: 'Virtual', value: 'virtual' },
  { label: 'In-Person', value: 'in-person' },
  { label: 'Hybrid', value: 'hybrid' },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublicSuperviseeFilterValues {
  q: string
  state: string
  format: string
}

interface PublicSuperviseeFiltersProps {
  initialValues: PublicSuperviseeFilterValues
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Horizontal sticky filter bar for the public /browse-supervisees page.
 * Syncs filter state to URL query params via router.push so results
 * are always server-rendered and shareable.
 */
export function PublicSuperviseeFilters({ initialValues }: PublicSuperviseeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Derive state/format directly from the URL — they push immediately so
  // there is never a desync, and no useEffect is needed to keep them in sync.
  const state = searchParams.get('state') ?? ''
  const format = searchParams.get('format') ?? ''

  // q needs local state for the debounced text input only.
  const [q, setQ] = useState(initialValues.q)
  // Mobile-only: the selects collapse behind a "Filters" toggle so the sticky
  // bar stays compact (search row only) instead of covering half the viewport.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushUrl = useCallback(
    (overrides: Partial<PublicSuperviseeFilterValues>) => {
      const next = { q, state, format, ...overrides }
      const params = new URLSearchParams()
      if (next.q.trim()) params.set('q', next.q.trim())
      if (next.state) params.set('state', next.state)
      if (next.format) params.set('format', next.format)
      const qs = params.toString()
      router.push(`/browse-supervisees${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [q, state, format, router],
  )

  function handleQChange(value: string) {
    setQ(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => pushUrl({ q: value }), 500)
  }

  function handleStateChange(value: string) {
    pushUrl({ state: value })
  }

  function handleFormatChange(value: string) {
    pushUrl({ format: value })
  }

  const hasActiveFilters = q || state || format

  function clearAll() {
    setQ('')
    router.push('/browse-supervisees', { scroll: false })
  }

  return (
    // Sticky below the 64px site header on all breakpoints; on mobile only the
    // compact search row sticks (selects collapse behind the Filters toggle).
    <div className="sticky top-16 z-20 border-b bg-background/95 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Filter row */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            pushUrl({})
          }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          {/* Keyword input + mobile filters toggle */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={q}
                onChange={(e) => handleQChange(e.target.value)}
                placeholder="Search by occupation, specialty…"
                aria-label="Search supervisees by occupation or specialty"
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((open) => !open)}
              aria-expanded={mobileFiltersOpen}
              aria-label="Toggle filters"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-medium text-muted-foreground sm:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Selects + actions — collapsed on mobile until toggled */}
          <div
            className={`${mobileFiltersOpen ? 'flex' : 'hidden'} flex-col gap-2 sm:flex sm:flex-row sm:items-center`}
          >
            {/* State select */}
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              aria-label="Filter by state"
              className="h-10 rounded-md border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-40"
            >
              <option value="">All States</option>
              {STATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Format select */}
            <select
              value={format}
              onChange={(e) => handleFormatChange(e.target.value)}
              aria-label="Filter by supervision format"
              className="h-10 rounded-md border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-36"
            >
              <option value="">All Formats</option>
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Search button */}
            <button
              type="submit"
              className="h-10 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Search
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Filtered by:</span>
            {state && (
              <ActiveTag
                label={STATE_OPTIONS.find((o) => o.value === state)?.label ?? state}
                onRemove={() => handleStateChange('')}
              />
            )}
            {format && (
              <ActiveTag
                label={FORMAT_OPTIONS.find((o) => o.value === format)?.label ?? format}
                onRemove={() => handleFormatChange('')}
              />
            )}
            {q && <ActiveTag label={`"${q}"`} onRemove={() => handleQChange('')} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active filter tag chip
// ---------------------------------------------------------------------------

function ActiveTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full border bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full hover:text-primary/70"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
