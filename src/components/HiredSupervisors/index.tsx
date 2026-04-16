'use client'

import { AlertCircle, Briefcase, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useHiresList } from '@/lib/hooks'
import {
  formatDate,
  formatDisplayName,
  formatFeeAmount,
  formatLocation,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

import { HireStatusBadge } from './HireStatusBadge'

const PAGE_SIZE = 10

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function HiredSupervisorsTableSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden p-0 shadow-sm">
      <Table className="text-[15px]">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
            {[
              'Supervisor',
              'Occupation',
              'Location',
              'Format',
              'Fee',
              'Status',
              'Requested',
              '',
            ].map((h) => (
              <TableHead
                key={h}
                className="h-12 px-4 text-xs font-semibold tracking-wide text-foreground"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-border/80">
              {Array.from({ length: 8 }).map((__, j) => (
                <TableCell key={j} className="px-4 py-4">
                  <Skeleton className="h-4 w-full max-w-[8rem]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function HiredSupervisorsEmpty() {
  return (
    <Card className="border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
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
      </CardContent>
    </Card>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function HiredSupervisorsError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">Failed to load hired supervisors</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Something went wrong. Please refresh the page to try again.
        </p>
      </CardContent>
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

// ─── Table row ────────────────────────────────────────────────────────────────

function HireRow({ hire }: { hire: HireListItem }) {
  const [reasonOpen, setReasonOpen] = useState(false)

  const supervisorName = formatDisplayName(hire.supervisor)
  const occupation = hire.supervisor.occupation?.name ?? '—'
  const specialty = hire.supervisor.specialty?.name
  const occupationDisplay = specialty ? `${occupation} · ${specialty}` : occupation
  const location = formatLocation(hire.supervisor.city, hire.supervisor.state)
  const format = formatSupervisionFormat(hire.supervisorFormat)
  const fee = formatFeeAmount(hire.supervisorFeeAmount, hire.supervisorFeeType)

  const hasRejectionReason = hire.status === 'REJECTED' && !!hire.rejectionReason

  return (
    <>
      <TableRow className="border-border/80">
        <TableCell className="px-4 py-3.5 font-semibold text-foreground">
          {supervisorName}
        </TableCell>
        <TableCell
          className="max-w-[200px] truncate px-4 py-3.5 text-foreground/90"
          title={occupationDisplay}
        >
          {occupationDisplay}
        </TableCell>
        <TableCell className="px-4 py-3.5 text-foreground/90">{location}</TableCell>
        <TableCell className="px-4 py-3.5 text-foreground">{format}</TableCell>
        <TableCell className="px-4 py-3.5 font-medium tabular-nums text-foreground">
          {fee}
        </TableCell>
        <TableCell className="px-4 py-3.5">
          <HireStatusBadge status={hire.status} />
        </TableCell>
        <TableCell className="px-4 py-3.5 text-sm tabular-nums text-foreground/90">
          {formatDate(hire.createdAt)}
        </TableCell>
        <TableCell className="px-4 py-3.5">
          <DropdownMenuRoot>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuPortal>
              <DropdownMenuPositioner>
                <DropdownMenuPopup>
                  <DropdownMenuItem>
                    <Link href={`/find-supervisors/${hire.supervisorId}`} className="w-full">
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  {hasRejectionReason && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => setReasonOpen(true)}>
                        View Reason
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuPopup>
              </DropdownMenuPositioner>
            </DropdownMenuPortal>
          </DropdownMenuRoot>
        </TableCell>
      </TableRow>

      {hasRejectionReason && (
        <DialogRoot open={reasonOpen} onOpenChange={setReasonOpen}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Rejection Reason</DialogTitle>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {hire.rejectionReason}
            </p>
          </DialogContent>
        </DialogRoot>
      )}
    </>
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
          Everyone you&apos;ve asked to supervise you is listed here. Columns show format, fee, and
          current status—use the row menu to view a profile or see a rejection reason.
        </p>
      </div>

      {isLoading ? (
        <HiredSupervisorsTableSkeleton />
      ) : isError ? (
        <HiredSupervisorsError />
      ) : items.length === 0 ? (
        <HiredSupervisorsEmpty />
      ) : (
        <>
          <Card className="gap-0 overflow-hidden p-0 shadow-sm">
            <Table className="text-[15px]">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Supervisor
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Occupation
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Location
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Format
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Fee
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Requested
                  </TableHead>
                  <TableHead className="h-12 w-[4.5rem] px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((hire) => (
                  <HireRow key={hire.id} hire={hire} />
                ))}
              </TableBody>
            </Table>
          </Card>

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
