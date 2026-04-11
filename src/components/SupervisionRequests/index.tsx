'use client'

import { AlertCircle, ChevronLeft, ChevronRight, ClipboardList, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
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

function SupervisionRequestsTableSkeleton() {
  const cols = 9
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: cols }).map((__, j) => (
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

function SupervisionRequestsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border py-16 text-center">
      <ClipboardList className="mb-3 size-10 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">No supervision requests yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Supervisees who request your supervision will appear here.
      </p>
    </div>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function SupervisionRequestsError() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border py-16 text-center">
      <AlertCircle className="mb-3 size-10 text-destructive/60" />
      <p className="text-sm font-medium text-foreground">Failed to load supervision requests</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong. Please refresh the page to try again.
      </p>
    </div>
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
    <TableRow>
      <TableCell className="font-medium">{superviseeName}</TableCell>
      <TableCell className="text-muted-foreground">{hire.supervisee.email}</TableCell>
      <TableCell className="text-muted-foreground">
        {formatContactNumber(hire.supervisee.contactNumber)}
      </TableCell>
      <TableCell className="max-w-[180px] truncate text-muted-foreground" title={occupationDisplay}>
        {occupationDisplay}
      </TableCell>
      <TableCell className="text-muted-foreground">{location}</TableCell>
      <TableCell>{format}</TableCell>
      <TableCell className="text-muted-foreground">{availability}</TableCell>
      <TableCell className="text-muted-foreground">{budget}</TableCell>
      <TableCell>
        <HireStatusBadge status={hire.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(hire.createdAt)}</TableCell>
      <TableCell>
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
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Supervisees who have requested supervision from you.
      </p>

      {isLoading ? (
        <SupervisionRequestsTableSkeleton />
      ) : isError ? (
        <SupervisionRequestsError />
      ) : items.length === 0 ? (
        <SupervisionRequestsEmpty />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((hire) => (
                  <RequestRow key={hire.id} hire={hire} />
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
