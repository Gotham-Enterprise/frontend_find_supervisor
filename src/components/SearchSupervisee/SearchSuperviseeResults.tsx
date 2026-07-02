'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { SupervisorCardSkeleton } from '../SearchSupervisor/SupervisorCardSkeleton'
import { EmptyState } from './EmptyState'
import { SORT_OPTIONS } from './helpers'
import { SuperviseeCard } from './SuperviseeCard'
import type { SortOption, SuperviseeSearchResult } from './types'

interface SearchSuperviseeResultsProps {
  supervisees: SuperviseeSearchResult[]
  total: number
  page: number
  pageSize: number
  sortBy: SortOption
  isLoading: boolean
  errorMessage: string | null
  onRetry: () => void
  onPageChange: (page: number) => void
  onSortChange: (sort: SortOption) => void
  onClearFilters: () => void
}

export function SearchSuperviseeResults({
  supervisees,
  total,
  page,
  pageSize,
  sortBy,
  isLoading,
  errorMessage,
  onRetry,
  onPageChange,
  onSortChange,
  onClearFilters,
}: SearchSuperviseeResultsProps) {
  const totalPages = Math.ceil(total / pageSize)
  const from = total > 0 ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, total)

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Best Match'

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        {isLoading ? (
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        ) : errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{total.toLocaleString()} supervisees</span>
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

      <div className="min-h-0 flex-1 overflow-y-auto pb-4 pt-4">
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SupervisorCardSkeleton key={i} />)
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-12 text-center">
              <p className="mb-4 max-w-md text-sm text-muted-foreground">
                We couldn&apos;t load supervisee results. Check your connection and try again.
              </p>
              <Button type="button" variant="outline" onClick={onRetry}>
                Try again
              </Button>
            </div>
          ) : supervisees.length === 0 ? (
            <EmptyState onClearFilters={onClearFilters} />
          ) : (
            supervisees.map((s) => <SuperviseeCard key={s.id} supervisee={s} />)
          )}
        </div>

        {!isLoading && !errorMessage && totalPages > 1 && (
          <div className="flex items-center justify-between pt-6">
            <p className="text-xs text-muted-foreground">
              Showing {from}–{to} of {total} results
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </div>
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
