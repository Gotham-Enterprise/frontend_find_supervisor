'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { EmptyState } from './EmptyState'
import { SORT_OPTIONS } from './helpers'
import { SupervisorCard } from './SupervisorCard'
import { SupervisorCardSkeleton } from './SupervisorCardSkeleton'
import type { SortOption, SupervisorSearchResult } from './types'

const PAGE_SIZE = 10

interface SearchSupervisorResultsProps {
  supervisors: SupervisorSearchResult[]
  total: number
  page: number
  sortBy: SortOption
  isLoading: boolean
  onPageChange: (page: number) => void
  onSortChange: (sort: SortOption) => void
  onClearFilters: () => void
}

export function SearchSupervisorResults({
  supervisors,
  total,
  page,
  sortBy,
  isLoading,
  onPageChange,
  onSortChange,
  onClearFilters,
}: SearchSupervisorResultsProps) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Best Match'

  return (
    <div className="min-w-0 flex-1 space-y-4">
      {/* Results header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isLoading ? (
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{total.toLocaleString()} supervisors</span>
            <span className="text-muted-foreground"> match your criteria</span>
          </p>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(v) => onSortChange((v ?? 'best_match') as SortOption)}
          >
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-sm">
              <SelectValue>{sortLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SupervisorCardSkeleton key={i} />)
        ) : supervisors.length === 0 ? (
          <EmptyState onClearFilters={onClearFilters} />
        ) : (
          supervisors.map((s) => <SupervisorCard key={s.id} supervisor={s} />)
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {from}–{to} of {total} results
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = buildPageNumbers(page, totalPages)

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="size-4" />
      </PageButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <PageButton key={p} onClick={() => onPageChange(p as number)} active={p === page}>
            {p}
          </PageButton>
        ),
      )}

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon className="size-4" />
      </PageButton>
    </nav>
  )
}

interface PageButtonProps extends React.ComponentProps<'button'> {
  active?: boolean
}

function PageButton({ children, active, className, ...props }: PageButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-8 items-center justify-center rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active
          ? 'bg-primary font-semibold text-white'
          : 'border border-border bg-card text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function buildPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (page > 3) pages.push('...')

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (page < totalPages - 2) pages.push('...')
  pages.push(totalPages)

  return pages
}
