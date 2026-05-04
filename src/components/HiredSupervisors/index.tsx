'use client'

import { AlertCircle, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useHiresList } from '@/lib/hooks'

import { HireRequestCard } from './HireRequestCard'

const PAGE_SIZE = 10

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function HiredSupervisorsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex min-w-0 gap-3">
              <Skeleton className="mt-0.5 size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full max-w-[14rem]" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-full max-w-[9rem]" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function HiredSupervisorsEmpty() {
  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">No hired supervisors yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Browse available supervisors and send a hire request to get started.
        </p>
        <Link
          href="/find-supervisors"
          className={buttonVariants({ size: 'default', className: 'mt-6' })}
        >
          Find a Supervisor
        </Link>
      </div>
    </Card>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function HiredSupervisorsError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">Failed to load hired supervisors</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Something went wrong. Please refresh the page to try again.
        </p>
      </div>
    </Card>
  )
}

// ─── Pagination controls ───────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-foreground">
        Showing {from}–{to} of {totalCount} result{totalCount !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-[4rem] text-center text-sm font-medium tabular-nums text-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function HiredSupervisorsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useHiresList(page, PAGE_SIZE)

  const items = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Your hire requests</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Everyone you&apos;ve asked to supervise you is listed here. Each card shows format, fee,
          and current status. Use the menu on any card to view a supervisor&apos;s profile or see
          the reason a request was declined.
        </p>
      </div>

      {isLoading ? (
        <HiredSupervisorsCardsSkeleton />
      ) : isError ? (
        <HiredSupervisorsError />
      ) : items.length === 0 ? (
        <HiredSupervisorsEmpty />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((hire) => (
              <HireRequestCard key={hire.id} hire={hire} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  )
}
