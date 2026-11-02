'use client'

import { MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { HirePaymentDialog } from '@/components/HirePayment/HirePaymentDialog'
import { MonthlyPaymentDialog } from '@/components/MonthlyBilling/MonthlyPaymentDialog'
import { LeaveReviewModal } from '@/components/reviews/LeaveReviewModal'
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
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { useCancelHire, useMarkHireAsCompleted, useUserSnackbar } from '@/lib/hooks'
import { useConfetti } from '@/lib/hooks/useConfetti'
import { useHireMonthlyBilling } from '@/lib/hooks/useMonthlyBilling'
import { parseApiError } from '@/lib/utils/error-parser'
import { workroomHref, type WorkroomTab } from '@/lib/utils/hire-workroom'
import { usesInAppMonthlyBilling } from '@/lib/utils/monthly-billing'
import { formatDateOnly, formatDisplayName } from '@/lib/utils/profile-formatters'
import { canMarkHireCompleted, getAgreementStage } from '@/lib/utils/supervision-status'
import type { HireListItem, HireStatus } from '@/types/hire'
import type { Review } from '@/types/review'

import { AgreementDialog } from './AgreementDialog'

const CANCELABLE_STATUSES: ReadonlyArray<HireStatus> = ['PENDING', 'REVIEWED', 'ACCEPTED', 'ACTIVE']

interface UseHireActionsOptions {
  existingReview?: Review
  /** Hired Medical Directors: profile and workroom links target the MD routes. */
  isMedicalDirectors?: boolean
  /** An `?agreement=review` link asked for this hire's agreement dialog; `onClose` dismisses it. */
  agreementDeepLink?: { open: boolean; onClose: () => void }
}

/**
 * What a supervisee can do with one hire — sign, set up payment, complete,
 * review, cancel — and the dialogs behind it, shared by the hired list's cards
 * and the hire's workroom so both offer the same actions.
 */
export function useHireActions(hire: HireListItem, options: UseHireActionsOptions = {}) {
  const { existingReview, isMedicalDirectors = false, agreementDeepLink } = options
  const [agreementOpenManually, setAgreementOpenManually] = useState(false)
  const agreementOpen = agreementOpenManually || (agreementDeepLink?.open ?? false)
  const setAgreementOpen = (open: boolean) => {
    setAgreementOpenManually(open)
    if (!open) agreementDeepLink?.onClose()
  }
  // Supervisee's payment step for hourly agreements (its own dialog, so the card form is in view).
  const [payment, setPayment] = useState<{ open: boolean; changeCard: boolean }>({
    open: false,
    changeCard: false,
  })
  const openPayment = (opts?: { changeCard?: boolean }) =>
    setPayment({ open: true, changeCard: opts?.changeCard ?? false })
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
  const workroomLink = (tab?: WorkroomTab) =>
    workroomHref(
      hire.id,
      tab,
      isMedicalDirectors ? '/hired-medical-directors' : '/hired-supervisors',
    )
  // Open the profile on the route matching the list it was reached from, and tell
  // the profile page where to go back to (the two hired lists are separate pages).
  const profileHref = isMedicalDirectors
    ? `/find-medical-directors/${hire.supervisorId}?from=hired-medical-directors`
    : `/find-supervisors/${hire.supervisorId}?from=hired-supervisors`

  const hasRejectionReason = hire.status === 'REJECTED' && Boolean(hire.rejectionReason?.trim())
  // A monthly hire already ending when its paid month runs out can't be ended again.
  const endScheduled = hire.scheduledEndAt != null
  const canCancel = CANCELABLE_STATUSES.includes(hire.status) && !endScheduled

  // Agreement: sign while the supervisor's proposal awaits the supervisee's signature
  const agreementStage = getAgreementStage(hire)
  const canSignAgreement =
    (hire.status === 'ACCEPTED' || hire.status === 'ACTIVE') &&
    agreementStage === 'AWAITING_SIGNATURE'
  const hasAgreement = hire.agreement != null
  const isAgreementSigned = hasAgreement && agreementStage === 'SIGNED'
  // Hourly agreement whose card for the weekly prepays isn't saved yet. The
  // card comes before the signature, so this covers the pending-signature stage too.
  // In-app monthly agreements (Medical Director retainers) need the card first too.
  const monthlyBilled = usesInAppMonthlyBilling(hire)
  const needsPaymentSetup =
    IN_APP_PAYMENTS_ENABLED &&
    (isAgreementSigned || canSignAgreement) &&
    (hire.status === 'ACCEPTED' || hire.status === 'ACTIVE') &&
    (hire.agreement?.hourlyRateCents != null || monthlyBilled) &&
    hire.paymentMethodSavedAt == null

  // Signed in-app monthly agreement: its months and payments are on the workroom's Billing tab.
  const hasMonthlyBilling = monthlyBilled && isAgreementSigned

  // Signed hourly agreement: sessions are logged and reviewed on the workroom's Timesheet tab.
  const hasSessions =
    IN_APP_PAYMENTS_ENABLED && isAgreementSigned && hire.agreement?.hourlyRateCents != null

  // Mark as Completed: only when ACCEPTED or ACTIVE, and the agreement is fully signed
  const canComplete = canMarkHireCompleted(hire) && !endScheduled

  // Ending a paid monthly hire keeps it running until the paid month ends (no refund).
  const { data: monthlyBilling } = useHireMonthlyBilling(
    hire.id,
    hasMonthlyBilling && (cancelOpen || completeOpen),
  )
  const paidMonth = monthlyBilling?.periods.find((p) => p.isCurrent && p.paymentStatus === 'PAID')
  const monthlyEndNote = hasMonthlyBilling
    ? paidMonth
      ? ` Since this month is already paid, supervision continues through ${formatDateOnly(paidMonth.endDate)}, and that month isn't refunded. No more monthly payments will be charged.`
      : ' No more monthly payments will be charged.'
    : ''

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
        if (hasMonthlyBilling && paidMonth) {
          // Completes when the paid month ends; the review comes after that.
          showSuccess('Supervision will complete at the end of this month.', {
            description: 'No more monthly payments will be charged.',
          })
          return
        }
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
        showSuccess(
          hasMonthlyBilling && paidMonth
            ? 'Supervision will end at the end of this month.'
            : 'Supervision request cancelled.',
          hasMonthlyBilling
            ? { description: 'No more monthly payments will be charged.' }
            : undefined,
        )
        setCancelOpen(false)
      },
      onError: (err) => {
        showError(parseApiError(err))
        setCancelOpen(false)
      },
    })
  }

  const openReview = () => {
    setPostCompleteReviewFlow(false)
    setReviewOpen(true)
  }

  /**
   * The ⋯ menu. On a card it links into the workroom (Request Details and View
   * Agreement open its Contract details tab); in the workroom those are tabs,
   * so they're left out.
   */
  function renderMenu(variant: 'card' | 'workroom') {
    const inWorkroom = variant === 'workroom'
    return (
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
              {!inWorkroom && (
                <DropdownMenuItem>
                  <Link href={workroomLink()} className="w-full">
                    Open Workroom
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Link href={profileHref} className="w-full">
                  View Profile
                </Link>
              </DropdownMenuItem>
              {!inWorkroom && (
                <DropdownMenuItem>
                  <Link href={workroomLink('details')} className="w-full">
                    Request Details
                  </Link>
                </DropdownMenuItem>
              )}
              {hasAgreement && (canSignAgreement || !inWorkroom) && (
                <>
                  <DropdownMenuSeparator />
                  {canSignAgreement ? (
                    <DropdownMenuItem onClick={() => setAgreementOpen(true)}>
                      Review &amp; Sign Agreement
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Link href={workroomLink('details')} className="w-full">
                        View Agreement
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {hasMonthlyBilling && !inWorkroom && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={workroomLink('billing')} className="w-full">
                      Monthly Billing
                    </Link>
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
                  <DropdownMenuItem onClick={openReview}>Leave Review</DropdownMenuItem>
                </>
              )}
              {hasReview && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={openReview}>Edit Review</DropdownMenuItem>
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
  }

  const dialogs = (
    <>
      {hasAgreement && (
        <AgreementDialog
          hire={hire}
          open={agreementOpen}
          onOpenChange={setAgreementOpen}
          canSign={canSignAgreement}
          onSetUpPayment={IN_APP_PAYMENTS_ENABLED ? openPayment : undefined}
        />
      )}

      {hasAgreement && IN_APP_PAYMENTS_ENABLED && !monthlyBilled && (
        <HirePaymentDialog
          hire={hire}
          open={payment.open}
          onOpenChange={(open) => setPayment((prev) => ({ ...prev, open }))}
          changeCard={payment.changeCard}
          // Card saved while the signature is still pending: bring them back to sign.
          onSaved={canSignAgreement ? () => setAgreementOpen(true) : undefined}
        />
      )}

      {monthlyBilled && (
        <MonthlyPaymentDialog
          hire={hire}
          open={payment.open}
          onOpenChange={(open) => setPayment((prev) => ({ ...prev, open }))}
          changeCard={payment.changeCard}
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
        description={
          hasMonthlyBilling
            ? `This will mark your supervision with ${supervisorName} as completed.${monthlyEndNote} This action cannot be undone.`
            : `This will mark your supervision with ${supervisorName} as completed. You can leave an optional review next, or skip and add one later from this card. This action cannot be undone.`
        }
        confirmLabel="Mark as Completed"
        isPending={completeMutation.isPending}
        onConfirm={handleCompleteConfirm}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => !open && setCancelOpen(false)}
        title={hasMonthlyBilling ? 'End supervision?' : 'Cancel supervision request?'}
        description={
          hasMonthlyBilling
            ? `You are about to end your supervision with ${supervisorName}.${monthlyEndNote} This action cannot be undone.`
            : `You are about to cancel your supervision request with ${supervisorName}. This action cannot be undone.`
        }
        confirmLabel={hasMonthlyBilling ? 'End Supervision' : 'Cancel Request'}
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

  return {
    supervisorName,
    profileHref,
    workroomLink,
    hasAgreement,
    isAgreementSigned,
    canSignAgreement,
    needsPaymentSetup,
    hasSessions,
    monthlyBilled,
    hasMonthlyBilling,
    openAgreement: () => setAgreementOpen(true),
    openPayment,
    renderMenu,
    dialogs,
  }
}
