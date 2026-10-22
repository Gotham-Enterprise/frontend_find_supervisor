'use client'

import {
  CalendarClock,
  CalendarDays,
  CreditCard,
  DollarSign,
  FileSignature,
  FileText,
  type LucideIcon,
  MapPin,
  Monitor,
  MoreVertical,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { HIRE_LIST_GRID } from '@/components/HireList/HireListToolbar'
import { HirePaymentDialog } from '@/components/HirePayment/HirePaymentDialog'
import { HireSessionsDialog } from '@/components/HireSessions/HireSessionsDialog'
import { LeaveReviewModal } from '@/components/reviews/LeaveReviewModal'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useCancelHire, useMarkHireAsCompleted, useUserSnackbar } from '@/lib/hooks'
import { useConfetti } from '@/lib/hooks/useConfetti'
import { cn } from '@/lib/utils'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  formatDate,
  formatDisplayName,
  formatFeeAmount,
  formatLocation,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import { canMarkHireCompleted, getAgreementStage } from '@/lib/utils/supervision-status'
import type { HireListItem, HireStatus } from '@/types/hire'
import type { Review } from '@/types/review'

import { AgreementDialog } from './AgreementDialog'
import { AgreementStageBadge } from './AgreementStageBadge'
import { HireRequestDetailsDialog } from './HireRequestDetailsDialog'
import { HireStatusBadge } from './HireStatusBadge'

const CANCELABLE_STATUSES: ReadonlyArray<HireStatus> = ['PENDING', 'REVIEWED', 'ACCEPTED', 'ACTIVE']

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
  /** Rendered on Hired Medical Directors — profile links + back links target the MD routes. */
  isMedicalDirectors?: boolean
  /** 'list' renders a compact row (inside a list container) instead of a card. */
  layout?: 'card' | 'list'
}

export function HireRequestCard({
  hire,
  existingReview,
  isMedicalDirectors = false,
  layout = 'card',
}: HireRequestCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  // Deep link: agreement notifications/emails point to the hired list with
  // ?hire=<id>, which auto-opens this card's agreement dialog. Driven by the
  // router's search params (not window.location at mount) so clicking a
  // notification while already on this page opens the dialog too.
  const deepLinkedHireId = useSearchParams().get('hire')
  const deepLinkMatches = hire.agreement != null && deepLinkedHireId === hire.id
  const [agreementOpenManually, setAgreementOpenManually] = useState(false)
  // Which deep-linked hire id the user has already closed the dialog for, so
  // the URL-driven open doesn't re-open it on the next render (derived state
  // instead of an effect + setState).
  const [dismissedDeepLinkId, setDismissedDeepLinkId] = useState<string | null>(null)
  const agreementOpen =
    agreementOpenManually || (deepLinkMatches && dismissedDeepLinkId !== deepLinkedHireId)
  const setAgreementOpen = (open: boolean) => {
    setAgreementOpenManually(open)
    if (!open && deepLinkMatches) setDismissedDeepLinkId(deepLinkedHireId)
  }
  // Supervisee's payment step for hourly agreements (its own dialog, so the card form is in view).
  const [payment, setPayment] = useState<{ open: boolean; changeCard: boolean }>({
    open: false,
    changeCard: false,
  })
  const openPayment = (options?: { changeCard?: boolean }) =>
    setPayment({ open: true, changeCard: options?.changeCard ?? false })
  // Sessions deep link (?sessions=<id>, from session notifications) works like the agreement one.
  const deepLinkedSessionsId = useSearchParams().get('sessions')
  const [sessionsOpenManually, setSessionsOpenManually] = useState(false)
  const [dismissedSessionsLinkId, setDismissedSessionsLinkId] = useState<string | null>(null)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  /** True while showing the review sheet immediately after “Mark as completed” (allows skip). */
  const [postCompleteReviewFlow, setPostCompleteReviewFlow] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const { burst } = useConfetti()
  const cancelMutation = useCancelHire()
  const completeMutation = useMarkHireAsCompleted()

  const supervisorName = formatDisplayName(hire.supervisor)
  // A supervisor's occupation/specialty live on their PROFILE. The account-level
  // user.occupation/specialty relations are jobseeker-side leftovers that can
  // hold unrelated values (e.g. "Accountant"), so they are deliberately ignored.
  const occupation = hire.supervisor.supervisorProfile?.occupation?.trim()
  const specialty = hire.supervisor.supervisorProfile?.specialty?.trim()
  const occupationDisplay =
    occupation && specialty
      ? `${occupation} · ${specialty}`
      : occupation || specialty || 'Not specified'

  const locationRaw = formatLocation(hire.supervisor.city, hire.supervisor.state)
  const formatRaw = formatSupervisionFormat(hire.supervisorFormat)
  const feeRaw = formatFeeAmount(hire.supervisorFeeAmount, hire.supervisorFeeType)
  const requestedRaw = formatDate(hire.createdAt)

  const hasRejectionReason = hire.status === 'REJECTED' && Boolean(hire.rejectionReason?.trim())
  const canCancel = CANCELABLE_STATUSES.includes(hire.status)
  // Open the profile on the route matching the list it was reached from, and tell
  // the profile page where to go back to (the two hired lists are separate pages).
  const profileHref = isMedicalDirectors
    ? `/find-medical-directors/${hire.supervisorId}?from=hired-medical-directors`
    : `/find-supervisors/${hire.supervisorId}?from=hired-supervisors`

  // Agreement: sign while the supervisor's proposal awaits the supervisee's signature
  const agreementStage = getAgreementStage(hire)
  const canSignAgreement =
    (hire.status === 'ACCEPTED' || hire.status === 'ACTIVE') &&
    agreementStage === 'AWAITING_SIGNATURE'
  const hasAgreement = hire.agreement != null
  const isAgreementSigned = hasAgreement && agreementStage === 'SIGNED'
  // Hourly agreement whose card for the weekly prepays isn't saved yet. The
  // card comes before the signature, so this covers the pending-signature stage too.
  const needsPaymentSetup =
    IN_APP_PAYMENTS_ENABLED &&
    (isAgreementSigned || canSignAgreement) &&
    (hire.status === 'ACCEPTED' || hire.status === 'ACTIVE') &&
    hire.agreement?.hourlyRateCents != null &&
    hire.paymentMethodSavedAt == null

  // Signed hourly agreement: sessions are logged and reviewed in the app.
  const hasSessions =
    IN_APP_PAYMENTS_ENABLED && isAgreementSigned && hire.agreement?.hourlyRateCents != null
  const sessionsDeepLinkMatches = hasSessions && deepLinkedSessionsId === hire.id
  const sessionsOpen =
    sessionsOpenManually ||
    (sessionsDeepLinkMatches && dismissedSessionsLinkId !== deepLinkedSessionsId)
  const setSessionsOpen = (open: boolean) => {
    setSessionsOpenManually(open)
    if (!open && sessionsDeepLinkMatches) setDismissedSessionsLinkId(deepLinkedSessionsId)
  }

  // Mark as Completed: only when ACCEPTED or ACTIVE, and the agreement is fully signed
  const canComplete = canMarkHireCompleted(hire)

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
        burst()
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

  const actionsMenu = (
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
            {hasAgreement && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAgreementOpen(true)}>
                  {canSignAgreement ? 'Review & Sign Agreement' : 'View Agreement'}
                </DropdownMenuItem>
              </>
            )}
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
  )

  const badges = (
    <>
      <HireStatusBadge status={hire.status} completedAt={hire.completedAt} />
      <AgreementStageBadge hire={hire} />
      {hire.hasReviewed && (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
          <Star className="size-2.5 fill-amber-500 text-amber-500" aria-hidden />
          Reviewed
        </span>
      )}
    </>
  )

  // List rows show the one action that matters most right now; the rest stay in the menu.
  const rowAction = canSignAgreement ? (
    <Button size="sm" onClick={() => setAgreementOpen(true)}>
      <FileSignature className="size-3.5" aria-hidden />
      Review &amp; Sign
    </Button>
  ) : needsPaymentSetup ? (
    <Button size="sm" onClick={() => openPayment()}>
      <CreditCard className="size-3.5" aria-hidden />
      Set up payment
    </Button>
  ) : hasSessions ? (
    <Button variant="outline" size="sm" onClick={() => setSessionsOpen(true)}>
      <CalendarClock className="size-3.5" aria-hidden />
      Sessions
    </Button>
  ) : null

  return (
    <>
      {layout === 'list' ? (
        <div
          className={cn(
            'flex flex-col gap-3 px-4 py-3',
            HIRE_LIST_GRID,
            canSignAgreement && 'bg-amber-50/60',
          )}
        >
          <Link
            href={profileHref}
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserAvatar
              src={hire.supervisor.profilePhotoUrl}
              name={supervisorName}
              alt={`Profile photo of ${supervisorName}`}
              size="md"
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground hover:underline">
                {supervisorName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{occupationDisplay}</p>
              <p className="truncate text-xs text-muted-foreground lg:hidden">
                {formatHireDetailDisplay(feeRaw)} · Requested{' '}
                {formatHireDetailDisplay(requestedRaw)}
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
          <p className="hidden truncate text-sm text-foreground lg:block">
            {formatHireDetailDisplay(feeRaw)}
          </p>
          <p className="hidden truncate text-sm text-foreground lg:block">
            {formatHireDetailDisplay(requestedRaw)}
          </p>
          <div className="flex items-center justify-end gap-2">
            {rowAction}
            {actionsMenu}
          </div>
        </div>
      ) : (
        <Card
          className={cn(
            'gap-0 overflow-hidden rounded-xl py-0 shadow-sm',
            hire.status === 'ACTIVE' && 'border-emerald-300',
          )}
        >
          {/* Active supervision gets a green accent so it stands out from accepted-but-not-started. */}
          {hire.status === 'ACTIVE' && (
            <div className="h-1 bg-gradient-to-r from-emerald-600 to-emerald-400" aria-hidden />
          )}
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
                <div className="mt-2 flex flex-wrap items-center gap-2">{badges}</div>
              </div>
            </div>

            <div className="flex shrink-0 self-start">{actionsMenu}</div>
          </div>

          {/* ── Details ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
            <DetailCell label="Location" value={locationRaw} icon={MapPin} />
            <DetailCell label="Format" value={formatRaw} icon={Monitor} />
            <DetailCell label="Fee" value={feeRaw} icon={DollarSign} />
            <DetailCell label="Requested" value={requestedRaw} icon={CalendarDays} />
          </div>

          {canSignAgreement && (
            <div className="flex flex-col gap-3 border-t border-amber-200 bg-amber-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <FileSignature className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">
                    {supervisorName} sent you an agreement to sign.
                  </span>{' '}
                  {needsPaymentSetup
                    ? 'Set up your payment card, then sign to start supervision.'
                    : "Supervision doesn't begin until you sign."}
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 self-stretch sm:self-center"
                onClick={() => setAgreementOpen(true)}
              >
                <FileSignature className="size-3.5" aria-hidden />
                Review &amp; Sign
              </Button>
            </div>
          )}

          {isAgreementSigned && (
            <div className="flex justify-end gap-2 border-t border-border/50 px-5 py-3">
              {hasSessions && (
                <Button variant="outline" size="sm" onClick={() => setSessionsOpen(true)}>
                  <CalendarClock className="size-3.5" aria-hidden />
                  Sessions
                </Button>
              )}
              {needsPaymentSetup && (
                <Button size="sm" onClick={() => openPayment()}>
                  <CreditCard className="size-3.5" aria-hidden />
                  Set up payment
                </Button>
              )}
              {hire.agreement?.fileUrl ? (
                <a
                  href={hire.agreement.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <FileText className="size-3.5" aria-hidden />
                  View Signed Agreement
                </a>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAgreementOpen(true)}>
                  <FileText className="size-3.5" aria-hidden />
                  View Signed Agreement
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      <HireRequestDetailsDialog hire={hire} open={detailsOpen} onOpenChange={setDetailsOpen} />

      {hasAgreement && (
        <AgreementDialog
          hire={hire}
          open={agreementOpen}
          onOpenChange={setAgreementOpen}
          canSign={canSignAgreement}
          onSetUpPayment={IN_APP_PAYMENTS_ENABLED ? openPayment : undefined}
        />
      )}

      {hasSessions && (
        <HireSessionsDialog
          hireId={hire.id}
          counterpartName={supervisorName}
          open={sessionsOpen}
          onOpenChange={setSessionsOpen}
          onChangeCard={() => openPayment({ changeCard: !needsPaymentSetup })}
        />
      )}

      {hasAgreement && IN_APP_PAYMENTS_ENABLED && (
        <HirePaymentDialog
          hire={hire}
          open={payment.open}
          onOpenChange={(open) => setPayment((prev) => ({ ...prev, open }))}
          changeCard={payment.changeCard}
          // Card saved while the signature is still pending: bring them back to sign.
          onSaved={canSignAgreement ? () => setAgreementOpen(true) : undefined}
        />
      )}

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
