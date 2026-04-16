'use client'

import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
import {
  useAcceptHire,
  useCancelHire,
  useHiresList,
  useRejectHire,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  formatAvailability,
  formatBudgetRange,
  formatContactNumber,
  formatDate,
  formatDisplayName,
  formatLocation,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import type { HireListItem, HireStatus } from '@/types/hire'

import { HireStatusBadge } from '../HiredSupervisors/HireStatusBadge'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

/** Actions that make sense per status, from the supervisor's perspective. */
const ALLOWED_ACTIONS: Record<HireStatus, ReadonlyArray<'accept' | 'reject' | 'cancel'>> = {
  PENDING: ['accept', 'reject'],
  ACCEPTED: ['cancel'],
  ACTIVE: ['cancel'],
  COMPLETED: [],
  CANCELED: [],
  REJECTED: [],
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SUPERVISION_REQUESTS_TABLE_HEADERS = [
  'Supervisee',
  'Email',
  'Contact',
  'Occupation',
  'Location',
  'Format',
  'Availability',
  'Budget',
  'Status',
  'Requested',
  '',
] as const

function SupervisionRequestsTableSkeleton() {
  const cols = SUPERVISION_REQUESTS_TABLE_HEADERS.length
  return (
    <Card className="gap-0 overflow-hidden p-0 shadow-sm">
      <Table className="text-[15px]">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
            {SUPERVISION_REQUESTS_TABLE_HEADERS.map((h) => (
              <TableHead
                key={h}
                className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-border/80">
              {Array.from({ length: cols }).map((__, j) => (
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

function SupervisionRequestsEmpty() {
  return (
    <Card className="border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <ClipboardList className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">No supervision requests yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Supervisees who request your supervision will appear here.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function SupervisionRequestsError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">
          Failed to load supervision requests
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Something went wrong. Please refresh the page to try again.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

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

// ─── Supervisee details modal ─────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || '—'}</dd>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap rounded-md bg-muted/50 px-3 py-2 text-sm text-foreground leading-relaxed">
        {value || '—'}
      </dd>
    </div>
  )
}

interface SuperviseeDetailsDialogProps {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SuperviseeDetailsDialog({ hire, open, onOpenChange }: SuperviseeDetailsDialogProps) {
  const { supervisee } = hire

  const occupation = supervisee.occupation?.name
  const specialty = supervisee.specialty?.name
  const location = formatLocation(supervisee.city, supervisee.state, supervisee.zipcode)
  const licensureStates = supervisee.stateOfLicensure?.length
    ? supervisee.stateOfLicensure.join(', ')
    : null

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogTitle>Supervisee Details</DialogTitle>

        {/* ── Supervisee profile ─────────────────────────────────────────── */}
        <section className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Profile</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <DetailItem label="Name" value={formatDisplayName(supervisee)} />
            <DetailItem label="Email" value={supervisee.email} />
            <DetailItem
              label="Contact Number"
              value={formatContactNumber(supervisee.contactNumber)}
            />
            <DetailItem label="Occupation" value={occupation} />
            <DetailItem label="Specialty" value={specialty} />
            <DetailItem label="Location" value={location} />
            <DetailItem label="State(s) of Licensure" value={licensureStates} />
          </dl>
        </section>

        <div className="my-5 border-t" />

        {/* ── Request details ────────────────────────────────────────────── */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Supervision Request</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <DetailItem
              label="Preferred Format"
              value={formatSupervisionFormat(hire.preferredFormat)}
            />
            <DetailItem
              label="Availability"
              value={formatAvailability(hire.preferredAvailability)}
            />
            <DetailItem label="Type of Supervisor" value={hire.typeOfSupervisorNeeded} />
            <DetailItem label="Looking in State" value={hire.stateTheyAreLookingIn} />
            <DetailItem label="Preferred Start Date" value={formatDate(hire.preferredStartDate)} />
            <DetailItem
              label="Budget"
              value={formatBudgetRange(
                hire.budgetRangeStart,
                hire.budgetRangeEnd,
                hire.budgetRangeType,
              )}
            />
          </dl>
        </section>

        <div className="my-5 border-t" />

        {/* ── Message & Goals ────────────────────────────────────────────── */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Message & Goals</h3>
          <dl className="space-y-4">
            <DetailBlock label="Intro Message" value={hire.introMessage} />
            <DetailBlock label="Goals" value={hire.goals} />
          </dl>
        </section>
      </DialogContent>
    </DialogRoot>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

type PendingAction = 'accept' | 'reject' | 'cancel' | null

interface RowActionsProps {
  hire: HireListItem
}

function RowActions({ hire }: RowActionsProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const { showSuccess, showError } = useUserSnackbar()

  const allowedActions = ALLOWED_ACTIONS[hire.status] ?? []

  const acceptMutation = useAcceptHire()
  const rejectMutation = useRejectHire()
  const cancelMutation = useCancelHire()

  const isMutating =
    acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending

  function closeDialog() {
    setPendingAction(null)
    setRejectionReason('')
  }

  function handleConfirm(action: 'accept' | 'cancel') {
    const mutation = action === 'accept' ? acceptMutation : cancelMutation
    const successMessages = {
      accept: 'Supervision request accepted.',
      cancel: 'Supervision request cancelled.',
    }
    mutation.mutate(hire.id, {
      onSuccess: () => {
        showSuccess(successMessages[action])
        closeDialog()
      },
      onError: (err) => {
        showError(parseApiError(err))
        closeDialog()
      },
    })
  }

  function handleRejectConfirm() {
    rejectMutation.mutate(
      { hireId: hire.id, reason: rejectionReason },
      {
        onSuccess: () => {
          showSuccess('Supervision request rejected.')
          closeDialog()
        },
        onError: (err) => {
          showError(parseApiError(err))
          closeDialog()
        },
      },
    )
  }

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" disabled={isMutating} aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuPopup>
              <DropdownMenuItem onClick={() => setDetailsOpen(true)}>View Details</DropdownMenuItem>

              {allowedActions.length > 0 && <DropdownMenuSeparator />}

              {allowedActions.includes('accept') && (
                <DropdownMenuItem onClick={() => setPendingAction('accept')}>
                  Accept
                </DropdownMenuItem>
              )}
              {allowedActions.includes('reject') && (
                <>
                  {allowedActions.includes('accept') && <DropdownMenuSeparator />}
                  <DropdownMenuItem destructive onClick={() => setPendingAction('reject')}>
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              {allowedActions.includes('cancel') && (
                <DropdownMenuItem destructive onClick={() => setPendingAction('cancel')}>
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <SuperviseeDetailsDialog hire={hire} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <ConfirmDialog
        open={pendingAction === 'accept'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Accept supervision request?"
        description={`You are about to accept the supervision request from ${formatDisplayName(hire.supervisee)}. This will notify them and mark the hire as accepted.`}
        confirmLabel="Accept"
        isPending={acceptMutation.isPending}
        onConfirm={() => handleConfirm('accept')}
      />

      <ConfirmDialog
        open={pendingAction === 'reject'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Reject supervision request?"
        description={`You are about to reject the supervision request from ${formatDisplayName(hire.supervisee)}.`}
        confirmLabel="Reject"
        destructive
        isPending={rejectMutation.isPending}
        confirmDisabled={!rejectionReason.trim()}
        onConfirm={handleRejectConfirm}
      >
        <label className="block text-sm font-medium text-foreground">
          Reason <span className="text-destructive">*</span>
          <textarea
            className="mt-1.5 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            rows={3}
            maxLength={500}
            placeholder="Explain why you are rejecting this request…"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={rejectMutation.isPending}
          />
          <span className="mt-1 block text-right text-xs text-muted-foreground">
            {rejectionReason.length}/500
          </span>
        </label>
      </ConfirmDialog>

      <ConfirmDialog
        open={pendingAction === 'cancel'}
        onOpenChange={(open) => !open && closeDialog()}
        title="Cancel supervision request?"
        description={`You are about to cancel the supervision arrangement with ${formatDisplayName(hire.supervisee)}. This action cannot be undone.`}
        confirmLabel="Cancel Request"
        destructive
        isPending={cancelMutation.isPending}
        onConfirm={() => handleConfirm('cancel')}
      />
    </>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function RequestRow({ hire }: { hire: HireListItem }) {
  const superviseeName = formatDisplayName(hire.supervisee)
  const occupation = hire.supervisee.occupation?.name ?? '—'
  const specialty = hire.supervisee.specialty?.name
  const occupationDisplay = specialty ? `${occupation} · ${specialty}` : occupation
  const location = formatLocation(hire.supervisee.city, hire.supervisee.state)
  const format = formatSupervisionFormat(hire.preferredFormat)
  const availability = formatAvailability(hire.preferredAvailability)
  const budget = formatBudgetRange(hire.budgetRangeStart, hire.budgetRangeEnd, hire.budgetRangeType)

  return (
    <TableRow className="border-border/80">
      <TableCell className="px-4 py-3.5 font-semibold text-foreground">{superviseeName}</TableCell>
      <TableCell
        className="max-w-[200px] truncate px-4 py-3.5 text-foreground/90"
        title={hire.supervisee.email}
      >
        {hire.supervisee.email}
      </TableCell>
      <TableCell className="px-4 py-3.5 text-foreground/90 tabular-nums">
        {formatContactNumber(hire.supervisee.contactNumber)}
      </TableCell>
      <TableCell
        className="max-w-[200px] truncate px-4 py-3.5 text-foreground/90"
        title={occupationDisplay}
      >
        {occupationDisplay}
      </TableCell>
      <TableCell className="px-4 py-3.5 text-foreground/90">{location}</TableCell>
      <TableCell className="px-4 py-3.5 text-foreground">{format}</TableCell>
      <TableCell
        className="max-w-[140px] truncate px-4 py-3.5 text-foreground/90"
        title={availability}
      >
        {availability}
      </TableCell>
      <TableCell className="px-4 py-3.5 font-medium tabular-nums text-foreground">
        {budget}
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <HireStatusBadge status={hire.status} />
      </TableCell>
      <TableCell className="px-4 py-3.5 text-sm tabular-nums text-foreground/90">
        {formatDate(hire.createdAt)}
      </TableCell>
      <TableCell className="px-4 py-3.5">
        <RowActions hire={hire} />
      </TableCell>
    </TableRow>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SupervisionRequestsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useHiresList(page, PAGE_SIZE)

  const items = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Incoming requests</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Supervisees who have asked you to supervise them appear below. Review format, budget, and
          status—open the row menu to view full details, accept, reject, or cancel when allowed.
        </p>
      </div>

      {isLoading ? (
        <SupervisionRequestsTableSkeleton />
      ) : isError ? (
        <SupervisionRequestsError />
      ) : items.length === 0 ? (
        <SupervisionRequestsEmpty />
      ) : (
        <>
          <Card className="gap-0 overflow-hidden p-0 shadow-sm">
            <Table className="text-[15px]">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Supervisee
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Email
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Contact
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
                    Availability
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wide text-foreground">
                    Budget
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
                  <RequestRow key={hire.id} hire={hire} />
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
