'use client'

import {
  CalendarDays,
  DollarSign,
  type LucideIcon,
  MapPin,
  Monitor,
  MoreVertical,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { LeaveReviewModal } from '@/components/reviews/LeaveReviewModal'
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
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useCancelHire, useMarkHireAsCompleted, useUserSnackbar } from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  formatDate,
  formatDisplayName,
  formatFeeAmount,
  formatLocation,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import type { HireListItem, HireStatus } from '@/types/hire'
import type { Review } from '@/types/review'

import { HireRequestDetailsDialog } from './HireRequestDetailsDialog'
import { HireStatusBadge } from './HireStatusBadge'

const CANCELABLE_STATUSES: ReadonlyArray<HireStatus> = ['PENDING', 'ACCEPTED', 'ACTIVE']

/** Normalizes API/formatter placeholders for empty values in supervisee-facing UI. */
function formatHireDetailDisplay(value: string): string {
  const v = value.trim()
  if (!v || v === 'N/A' || v === '—') return 'Not specified'
  return value
}

function DetailCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  const display = formatHireDetailDisplay(value)
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

interface HireRequestCardProps {
  hire: HireListItem
  existingReview?: Review
}

export function HireRequestCard({ hire, existingReview }: HireRequestCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  /** True while showing the review sheet immediately after “Mark as completed” (allows skip). */
  const [postCompleteReviewFlow, setPostCompleteReviewFlow] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const cancelMutation = useCancelHire()
  const completeMutation = useMarkHireAsCompleted()

  const supervisorName = formatDisplayName(hire.supervisor)
  const occupation = hire.supervisor.occupation?.name?.trim()
  const specialty = hire.supervisor.specialty?.name?.trim()
  const occupationDisplay =
    occupation && specialty
      ? `${occupation} · ${specialty}`
      : (occupation ?? specialty ?? 'Not specified')

  const locationRaw = formatLocation(hire.supervisor.city, hire.supervisor.state)
  const formatRaw = formatSupervisionFormat(hire.supervisorFormat)
  const feeRaw = formatFeeAmount(hire.supervisorFeeAmount, hire.supervisorFeeType)
  const requestedRaw = formatDate(hire.createdAt)

  const hasRejectionReason = hire.status === 'REJECTED' && Boolean(hire.rejectionReason?.trim())
  const canCancel = CANCELABLE_STATUSES.includes(hire.status)
  const profileHref = `/find-supervisors/${hire.supervisorId}?from=hired-supervisors`

  // Mark as Completed: only when ACCEPTED or ACTIVE (supervisee has no end-date restriction)
  const canComplete = hire.status === 'ACCEPTED' || hire.status === 'ACTIVE'

  // Review eligibility:
  // - "Leave Review": hire is COMPLETED and no review submitted yet
  // - "Edit Review": a review already exists for this hire
  const hasReview = !!existingReview
  const canReview = hire.status === 'COMPLETED' && !hasReview

  function handleReviewOpenChange(open: boolean) {
    setReviewOpen(open)
    if (!open) {
      setPostCompleteReviewFlow(false)
    }
  }

  function handleCompleteConfirm() {
    completeMutation.mutate(hire.id, {
      onSuccess: () => {
        setCompleteOpen(false)
        showSuccess('Supervision marked as completed.')
        setPostCompleteReviewFlow(true)
        setReviewOpen(true)
      },
      onError: (err) => {
        showError(parseApiError(err))
        setCompleteOpen(false)
      },
    })
  }

  function handleCancelConfirm() {
    cancelMutation.mutate(hire.id, {
      onSuccess: () => {
        showSuccess('Supervision request cancelled.')
        setCancelOpen(false)
      },
      onError: (err) => {
        showError(parseApiError(err))
        setCancelOpen(false)
      },
    })
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
          <div className="flex min-w-0 flex-1 gap-3">
            <Link
              href={profileHref}
              className="mt-0.5 shrink-0 rounded-lg outline-none ring-offset-background transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <UserAvatar
                src={hire.supervisor.profilePhotoUrl}
                name={supervisorName}
                alt={`Profile photo of ${supervisorName}`}
                size="lg"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={profileHref}
                className="block rounded-lg py-0.5 outline-none ring-offset-background transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h3 className="truncate text-sm font-semibold leading-tight tracking-tight text-foreground">
                  {supervisorName}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {occupationDisplay}
                </p>
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <HireStatusBadge status={hire.status} />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 self-start">
            <DropdownMenuRoot>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="Request actions">
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuPortal>
                <DropdownMenuPositioner>
                  <DropdownMenuPopup>
                    <DropdownMenuItem>
                      <Link href={profileHref} className="w-full">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                      Request Details
                    </DropdownMenuItem>
                    {hasRejectionReason && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => setReasonOpen(true)}>
                          View Reason
                        </DropdownMenuItem>
                      </>
                    )}
                    {canComplete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setCompleteOpen(true)}>
                          Mark as Completed
                        </DropdownMenuItem>
                      </>
                    )}
                    {canReview && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setPostCompleteReviewFlow(false)
                            setReviewOpen(true)
                          }}
                        >
                          Leave Review
                        </DropdownMenuItem>
                      </>
                    )}
                    {hasReview && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setPostCompleteReviewFlow(false)
                            setReviewOpen(true)
                          }}
                        >
                          Edit Review
                        </DropdownMenuItem>
                      </>
                    )}
                    {canCancel && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => setCancelOpen(true)}>
                          Cancel Request
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </div>
        </div>

        {/* ── Details ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
          <DetailCell label="Location" value={locationRaw} icon={MapPin} />
          <DetailCell label="Format" value={formatRaw} icon={Monitor} />
          <DetailCell label="Fee" value={feeRaw} icon={DollarSign} />
          <DetailCell label="Requested" value={requestedRaw} icon={CalendarDays} />
        </div>
      </Card>

      <HireRequestDetailsDialog hire={hire} open={detailsOpen} onOpenChange={setDetailsOpen} />

      {hasRejectionReason && (
        <DialogRoot open={reasonOpen} onOpenChange={setReasonOpen}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Rejection Reason</DialogTitle>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {hire.rejectionReason}
            </p>
          </DialogContent>
        </DialogRoot>
      )}

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Mark supervision as completed?"
        description={`This will mark your supervision with ${supervisorName} as completed. You can leave an optional review next, or skip and add one later from this card. This action cannot be undone.`}
        confirmLabel="Mark as Completed"
        isPending={completeMutation.isPending}
        onConfirm={handleCompleteConfirm}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => !open && setCancelOpen(false)}
        title="Cancel supervision request?"
        description={`You are about to cancel your supervision request with ${supervisorName}. This action cannot be undone.`}
        confirmLabel="Cancel Request"
        destructive
        isPending={cancelMutation.isPending}
        onConfirm={handleCancelConfirm}
      />

      {(canReview || hasReview || postCompleteReviewFlow) && (
        <LeaveReviewModal
          open={reviewOpen}
          onOpenChange={handleReviewOpenChange}
          hireId={hire.id}
          supervisorName={supervisorName}
          existingReview={existingReview}
          allowSkip={postCompleteReviewFlow && !hasReview}
        />
      )}
    </>
  )
}
