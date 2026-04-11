'use client'

import { AlertCircle, Briefcase, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 8 }).map((__, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function HiredSupervisorsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border py-16 text-center">
      <Briefcase className="mb-3 size-10 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">No hired supervisors yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse available supervisors and send a hire request to get started.
      </p>
      <Link href="/supervisors" className={buttonVariants({ size: 'sm', className: 'mt-4' })}>
        Find a Supervisor
      </Link>
    </div>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function HiredSupervisorsError() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border py-16 text-center">
      <AlertCircle className="mb-3 size-10 text-destructive/60" />
      <p className="text-sm font-medium text-foreground">Failed to load hired supervisors</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong. Please refresh the page to try again.
      </p>
    </div>
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
    <div className="flex items-center justify-between px-1 pt-3 text-sm text-muted-foreground">
      <span>
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
        <span className="min-w-[4rem] text-center text-sm">
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
      <TableRow>
        <TableCell className="font-medium">{supervisorName}</TableCell>
        <TableCell
          className="max-w-[180px] truncate text-muted-foreground"
          title={occupationDisplay}
        >
          {occupationDisplay}
        </TableCell>
        <TableCell className="text-muted-foreground">{location}</TableCell>
        <TableCell>{format}</TableCell>
        <TableCell>{fee}</TableCell>
        <TableCell>
          <HireStatusBadge status={hire.status} />
        </TableCell>
        <TableCell className="text-muted-foreground">{formatDate(hire.createdAt)}</TableCell>
        <TableCell>
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
                    <Link href={`/supervisors/${hire.supervisorId}`} className="w-full">
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
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        All supervisors you have sent a hire request to.
      </p>

      {isLoading ? (
        <HiredSupervisorsTableSkeleton />
      ) : isError ? (
        <HiredSupervisorsError />
      ) : items.length === 0 ? (
        <HiredSupervisorsEmpty />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((hire) => (
                  <HireRow key={hire.id} hire={hire} />
                ))}
              </TableBody>
            </Table>
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
