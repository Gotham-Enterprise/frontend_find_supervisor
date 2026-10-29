'use client'

import { LayoutGrid, List, Search, SearchX, X } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { HireListGroup } from '@/lib/api/supervision'
import { cn } from '@/lib/utils'

// ─── Status groups ────────────────────────────────────────────────────────────

export type HireListGroupFilter = 'all' | HireListGroup

export const HIRE_LIST_GROUPS: { id: HireListGroupFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'needs_action', label: 'Needs action' },
  { id: 'pending', label: 'Pending' },
  { id: 'active', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'closed', label: 'Closed' },
]

// ─── View preference (cards | list), remembered per page ──────────────────────

export type HireListView = 'cards' | 'list'

const VIEW_CHANGE_EVENT = 'hire-list-view-change'

function readView(storageKey: string): HireListView {
  try {
    return localStorage.getItem(storageKey) === 'list' ? 'list' : 'cards'
  } catch {
    return 'cards'
  }
}

function subscribeToView(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(VIEW_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(VIEW_CHANGE_EVENT, onChange)
  }
}

/** Cards on the server and first paint; the saved choice once the browser can read it. */
export function useHireListView(storageKey: string): [HireListView, (view: HireListView) => void] {
  const view = useSyncExternalStore(
    subscribeToView,
    () => readView(storageKey),
    () => 'cards' as const,
  )
  const setView = (next: HireListView) => {
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // Storage blocked (private window): the choice just isn't remembered.
    }
    window.dispatchEvent(new Event(VIEW_CHANGE_EVENT))
  }
  return [view, setView]
}

// ─── Debounced search ─────────────────────────────────────────────────────────

export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface HireListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  group: HireListGroupFilter
  onGroupChange: (group: HireListGroupFilter) => void
  view: HireListView
  onViewChange: (view: HireListView) => void
  /** Accessible name for the status filter, e.g. "Filter supervisees by status". */
  groupLabel: string
  /** Status groups to offer, in display order; defaults to all of them. */
  groups?: readonly HireListGroupFilter[]
}

export function HireListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  group,
  onGroupChange,
  view,
  onViewChange,
  groupLabel,
  groups,
}: HireListToolbarProps) {
  const groupOptions = groups
    ? HIRE_LIST_GROUPS.filter((option) => groups.includes(option.id))
    : HIRE_LIST_GROUPS
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          // Plain text, not type="search": the browser's own clear (×) would
          // double up with the clear button below.
          type="text"
          enterKeyHint="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="min-w-48 flex-1 sm:max-w-sm"
          startAdornment={<Search className="size-4" aria-hidden />}
          endAdornment={
            search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : undefined
          }
        />
        <div
          className="ml-auto flex shrink-0 rounded-lg border border-border bg-card p-0.5"
          role="group"
          aria-label="Layout"
        >
          {(
            [
              { id: 'cards', label: 'Cards', icon: LayoutGrid },
              { id: 'list', label: 'List', icon: List },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              aria-label={`${label} view`}
              title={`${label} view`}
              onClick={() => onViewChange(id)}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors',
                view === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={groupLabel}>
        {groupOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={group === option.id}
            onClick={() => onGroupChange(option.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              group === option.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Shown when a search or status filter matches nothing (the list itself isn't empty). */
export function HireListNoResults({ onClear }: { onClear: () => void }) {
  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">No matches</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Nothing matches your search or status filter.
        </p>
        <Button variant="outline" className="mt-5" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    </Card>
  )
}

/**
 * Shared column template for list rows and their header (lg and up; rows stack
 * below that): name · status · detail · date · actions. Proportional columns so
 * wide screens spread the space instead of handing it all to the name.
 */
export const HIRE_LIST_GRID =
  'lg:grid lg:grid-cols-[minmax(10rem,1.6fr)_minmax(10rem,1.4fr)_minmax(4.5rem,0.7fr)_minmax(7rem,0.9fr)_10.5rem] lg:items-center lg:gap-3'

/** Column headings above list rows. */
export function HireListHeader({
  detailLabel,
  dateLabel,
}: {
  detailLabel: string
  dateLabel: string
}) {
  return (
    <div
      className={cn(
        'hidden border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
        HIRE_LIST_GRID,
      )}
    >
      <span>Name</span>
      <span>Status</span>
      <span>{detailLabel}</span>
      <span>{dateLabel}</span>
      <span className="text-right">Actions</span>
    </div>
  )
}
