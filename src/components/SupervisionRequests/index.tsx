'use client'

import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Info,
  type LucideIcon,
  MapPin,
  Monitor,
  MoreVertical,
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

import { SubscriptionModal } from '@/components/Dashboard/subscription/SubscriptionModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { UserAvatar } from '@/components/ui/UserAvatar'
import { isFreePlan } from '@/lib/constants/subscription-plans'
import {
  useAcceptHire,
  useHiresList,
  useRejectHire,
  useStatesOptions,
  useSuperviseeFormOptions,
  useSupervisorProfile,
  useUserSnackbar,
  useViewHire,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  formatAvailability,
  formatBudgetRange,
  formatContactNumber,
  formatDate,
  formatDisplayName,
  formatLocation,
  formatLookingInStatesLabel,
  formatSupervisionFormat,
  resolveSupervisorTypeLabel,
} from '@/lib/utils/profile-formatters'
import type { HireListItem, HireStatus } from '@/types/hire'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

import { HireStatusBadge } from '../HiredSupervisors/HireStatusBadge'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

/** Incoming hires awaiting supervisor action (not yet accepted/rejected). */
const SUPERVISION_REQUEST_STATUS: HireStatus[] = ['PENDING', 'REVIEWED']

function hasActivePaidSupervisionSubscription(profile: SupervisorProfileData): boolean {
  return (
    profile.user.subscriptions?.some(
      (s) => (s.status === 'ACTIVE' || s.status === 'TRIALING') && !!s.plan && !isFreePlan(s.plan),
    ) ?? false
  )
}

/** Actions available to the supervisor. Only supervisees can cancel. */
const ALLOWED_ACTIONS: Record<HireStatus, ReadonlyArray<'accept' | 'reject'>> = {
  PENDING: ['accept', 'reject'],
  ACCEPTED: [],
  ACTIVE: [],
  COMPLETED: [],
  CANCELED: [],
  REJECTED: [],
  REVIEWED: ['accept', 'reject'],
}

// ─── Detail cell ──────────────────────────────────────────────────────────────

function DetailCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  const display = value.trim() && value !== 'N/A' && value !== '—' ? value : 'Not specified'
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        <Icon className="size-3 shrink-0" aria-hidden />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{display}</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SupervisionRequestsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex min-w-0 flex-1 gap-3">
              <Skeleton className="mt-0.5 size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full max-w-[14rem]" />
                <Skeleton className="mt-2 h-5 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex shrink-0 self-start">
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

function SupervisionRequestsEmpty() {
  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <ClipboardList className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">No supervision requests yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Pending requests will appear here when supervisees ask you to supervise them.
        </p>
      </div>
    </Card>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function SupervisionRequestsError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">
          Failed to load supervision requests
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">
          Something went wrong. Please refresh the page to try again.
        </p>
      </div>
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
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{value || '—'}</dd>
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-w-0 break-words whitespace-pre-wrap rounded-md bg-muted/50 px-3 py-2 text-sm text-foreground leading-relaxed">
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
  const { supervisorTypes } = useSuperviseeFormOptions()
  const { data: stateOptions = [] } = useStatesOptions()
  const supervisorTypeOptions = supervisorTypes.data ?? []
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
            <DetailItem
              label="Type of Supervisor"
              value={resolveSupervisorTypeLabel(hire.typeOfSupervisorNeeded, supervisorTypeOptions)}
            />
            <DetailItem
              label="Looking in State"
              value={formatLookingInStatesLabel(hire.stateTheyAreLookingIn, stateOptions)}
            />
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

type PendingAction = 'accept' | 'reject' | null

interface RowActionsProps {
  hire: HireListItem
  showHireDecisions: boolean
}

function RowActions({ hire, showHireDecisions }: RowActionsProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const { showSuccess, showError } = useUserSnackbar()

  const allowedActions = ALLOWED_ACTIONS[hire.status] ?? []
  const visibleActions = showHireDecisions
    ? allowedActions
    : allowedActions.filter((a) => a !== 'accept' && a !== 'reject')

  const acceptMutation = useAcceptHire()
  const rejectMutation = useRejectHire()
  const viewMutation = useViewHire()

  function handleViewDetails() {
    setDetailsOpen(true)
    if (hire.status === 'PENDING') {
      viewMutation.mutate(hire.id)
    }
  }

  const isMutating = acceptMutation.isPending || rejectMutation.isPending

  function closeDialog() {
    setPendingAction(null)
    setRejectionReason('')
  }

  function handleAcceptConfirm() {
    acceptMutation.mutate(hire.id, {
      onSuccess: () => {
        showSuccess('Supervision request accepted.')
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
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuPopup>
              <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>

              {visibleActions.length > 0 && <DropdownMenuSeparator />}

              {visibleActions.includes('accept') && (
                <DropdownMenuItem onClick={() => setPendingAction('accept')}>
                  Accept
                </DropdownMenuItem>
              )}
              {visibleActions.includes('reject') && (
                <>
                  {visibleActions.includes('accept') && <DropdownMenuSeparator />}
                  <DropdownMenuItem destructive onClick={() => setPendingAction('reject')}>
                    Reject
                  </DropdownMenuItem>
                </>
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
        onConfirm={handleAcceptConfirm}
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
    </>
  )
}

// ─── Request card ─────────────────────────────────────────────────────────────

function SupervisionRequestCard({
  hire,
  showHireDecisions,
}: {
  hire: HireListItem
  showHireDecisions: boolean
}) {
  const superviseeName = formatDisplayName(hire.supervisee)
  const occupation = hire.supervisee.occupation?.name?.trim()
  const specialty = hire.supervisee.specialty?.name?.trim()
  const occupationDisplay =
    occupation && specialty
      ? `${occupation} · ${specialty}`
      : (occupation ?? specialty ?? 'Not specified')

  const locationRaw = formatLocation(hire.supervisee.city, hire.supervisee.state)
  const formatRaw = formatSupervisionFormat(hire.preferredFormat)
  const budgetRaw = formatBudgetRange(
    hire.budgetRangeStart,
    hire.budgetRangeEnd,
    hire.budgetRangeType,
  )
  const requestedRaw = formatDate(hire.createdAt)

  return (
    <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex min-w-0 flex-1 gap-3">
          <UserAvatar
            src={hire.supervisee.profilePhotoUrl}
            name={superviseeName}
            alt={`Profile photo of ${superviseeName}`}
            size="lg"
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
              {superviseeName}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {occupationDisplay}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <HireStatusBadge status={hire.status} completedAt={hire.completedAt} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 self-start">
          <RowActions hire={hire} showHireDecisions={showHireDecisions} />
        </div>
      </div>

      {/* ── Details ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
        <DetailCell label="Location" value={locationRaw} icon={MapPin} />
        <DetailCell label="Format" value={formatRaw} icon={Monitor} />
        <DetailCell label="Budget" value={budgetRaw} icon={DollarSign} />
        <DetailCell label="Requested" value={requestedRaw} icon={CalendarDays} />
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SupervisionRequestsPage() {
  const [page, setPage] = useState(1)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const { data, isLoading, isError } = useHiresList(page, PAGE_SIZE, SUPERVISION_REQUEST_STATUS)
  const { data: profile, isLoading: profileLoading, isError: profileError } = useSupervisorProfile()

  const showHireDecisions =
    profile != null &&
    !profileLoading &&
    !profileError &&
    hasActivePaidSupervisionSubscription(profile)

  const showUpgradeCallout =
    profile != null &&
    !profileLoading &&
    !profileError &&
    !hasActivePaidSupervisionSubscription(profile)

  const items = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Incoming requests
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pending requests appear below (accepted, active, and completed hires are on other
            pages). Use the menu on any card to view full details, accept, or reject when allowed.
          </p>
          {showUpgradeCallout && (
            <div className="max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 items-start gap-2 sm:items-center">
                  <Info className="mt-0.5 size-4 shrink-0 text-amber-600 sm:mt-0" aria-hidden />
                  <p className="text-sm font-medium text-amber-950">
                    Accepting supervisees is only available for upgraded plans.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 self-stretch sm:self-center"
                  onClick={() => setPlanModalOpen(true)}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <SupervisionRequestsSkeleton />
        ) : isError ? (
          <SupervisionRequestsError />
        ) : items.length === 0 ? (
          <SupervisionRequestsEmpty />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((hire) => (
                <SupervisionRequestCard
                  key={hire.id}
                  hire={hire}
                  showHireDecisions={showHireDecisions}
                />
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

      <SubscriptionModal open={planModalOpen} onOpenChange={setPlanModalOpen} />
    </>
  )
}
