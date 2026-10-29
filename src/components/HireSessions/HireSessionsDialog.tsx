'use client'

import {
  AlertCircle,
  CalendarClock,
  ChevronDown,
  CreditCard,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  CardPaymentError,
  useApproveBillingWeek,
  useDeleteHireSession,
  useDisputeBillingWeek,
  useHireBillingWeeks,
  usePayNowBillingWeek,
  useRespondToLateSession,
  useUserSnackbar,
} from '@/lib/hooks'
import {
  formatCalendarDate,
  formatDuration,
  formatEasternDate,
  formatEasternDateTime,
  formatWeekRange,
  toEasternISODate,
} from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import type {
  BillingWeek,
  BillingWeekStatus,
  HireBillingWeeks,
  HireSession,
  LateEntryRequest,
  SuperviseeWeekPayment,
} from '@/types/sessions'

import { DisputeAttachmentsField, DisputeAttachmentThumbs } from './DisputeAttachmentsField'
import { LateEntryRequestDialog } from './LateEntryRequestDialog'
import { SessionFormDialog } from './SessionFormDialog'

const DISPUTE_REASON_MIN = 10

/** "2026-10-25" → "2026-10-26" (calendar math, no timezone shift). */
function nextCalendarDay(isoDate: string): string {
  return addCalendarDays(isoDate, 1)
}

function addCalendarDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const LATE_ENTRY_WINDOW_DAYS = 14
/** Weeks shown in full; earlier ones collapse to one line until opened. */
const EXPANDED_WEEKS = 4

/** A closed week the supervisor can still ask support to add a session to. */
function canRequestLateEntry(week: BillingWeek, role: HireBillingWeeks['role']): boolean {
  return (
    role === 'supervisor' &&
    week.status !== 'OPEN' &&
    toEasternISODate() <= addCalendarDays(week.endDate, LATE_ENTRY_WINDOW_DAYS)
  )
}

// Light tinted badges (same palette as the agreement-stage badges) instead of
// the solid default/secondary variants, which read too heavy inside the card.
const STATUS_BADGE: Record<BillingWeekStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'border-border bg-muted/40 text-muted-foreground' },
  IN_REVIEW: { label: 'In Review', className: 'border-amber-200 bg-amber-50 text-amber-800' },
  DISPUTED: { label: 'Disputed', className: 'border-red-200 bg-red-50 text-red-800' },
  APPROVED: { label: 'Approved', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  SETTLED: { label: 'Paid', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
}

export function ProgressSummary({ data }: { data: HireBillingWeeks }) {
  const { progress, terms } = data
  const approvedHours = progress.approvedMinutes / 60
  const pct =
    progress.totalMinutes != null && progress.totalMinutes > 0
      ? Math.min((progress.approvedMinutes / progress.totalMinutes) * 100, 100)
      : null
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <p className="text-sm font-medium text-foreground">
        {progress.totalMinutes != null
          ? `${approvedHours} of ${progress.totalMinutes / 60} hours approved`
          : `${approvedHours} hours approved`}
      </p>
      {pct != null && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {formatDuration(progress.loggedMinutes)} logged in total ·{' '}
        {formatUsdCents(terms.hourlyRateCents)}/hour · up to{' '}
        {formatDuration(terms.weeklyCapMinutes)} per week
      </p>
      {'netPaidCents' in data.totals && data.totals.chargedCents > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          Paid so far: {formatUsdCents(data.totals.netPaidCents)}
          {data.totals.refundedCents > 0 &&
            ` (${formatUsdCents(data.totals.chargedCents)} charged, ${formatUsdCents(data.totals.refundedCents)} back to your card for unused hours)`}
        </p>
      )}
      {'paidOutCents' in data.totals && data.totals.paidOutCents > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          Paid out to you so far: {formatUsdCents(data.totals.paidOutCents)}
        </p>
      )}
    </div>
  )
}

/** What happens with this week next, from the viewer's side. */
function weekStatusText(week: BillingWeek, role: HireBillingWeeks['role']): string {
  switch (week.status) {
    case 'OPEN':
      return role === 'supervisor'
        ? `Log this week's sessions by ${formatEasternDateTime(week.logDeadlineAt)}.`
        : `Your supervisor can log sessions until ${formatEasternDateTime(week.logDeadlineAt)}; you'll review them after that.`
    case 'IN_REVIEW':
      return role === 'supervisee'
        ? `Review by ${formatEasternDateTime(week.reviewEndsAt)}. If you don't, the week is approved automatically.`
        : `Waiting for your supervisee's review until ${formatEasternDateTime(week.reviewEndsAt)}; approved automatically after that.`
    case 'DISPUTED':
      return 'Disputed — Gotham support will review this week and contact you both.'
    case 'APPROVED':
    case 'SETTLED': {
      const by =
        week.approvedBy === 'SUPERVISEE'
          ? role === 'supervisee'
            ? 'by you'
            : 'by your supervisee'
          : week.approvedBy === 'SUPPORT'
            ? 'by Gotham support'
            : 'automatically'
      return week.approvedMinutes === 0
        ? 'Closed with no sessions logged.'
        : `${formatDuration(week.approvedMinutes ?? 0)} approved ${by}.`
    }
  }
}

/** A late session added by Gotham support: its approval and, if charged on its own, the charge. */
function LateSessionStatus({
  session,
  role,
  isResponding,
  onRespond,
}: {
  session: HireSession
  role: HireBillingWeeks['role']
  isResponding: boolean
  onRespond: (approve: boolean) => void
}) {
  if (session.source !== 'SUPPORT') return null
  if (session.canRespond) {
    return (
      <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        <p>
          Gotham support added this session because it wasn&apos;t logged in time. Approve it if it
          happened as described. If this week is already settled, approving charges your card for
          these hours plus the service fee.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isResponding}
            onClick={() => onRespond(false)}
          >
            Reject
          </Button>
          <Button size="sm" disabled={isResponding} onClick={() => onRespond(true)}>
            Approve
          </Button>
        </div>
      </div>
    )
  }
  let text = 'Late session added by Gotham support'
  if (session.approvalStatus === 'PENDING') {
    text += ' · waiting for your supervisee to approve it'
  } else if (session.approvalStatus === 'REJECTED') {
    text += ' · rejected'
  } else if (session.chargeStatus === 'PAID' && session.lateChargeCents != null) {
    text +=
      role === 'supervisee'
        ? ` · charged ${formatUsdCents(session.lateChargeCents)}`
        : ` · you were paid ${formatUsdCents(session.lateChargeCents)}`
  } else if (session.chargeStatus === 'FAILED') {
    text +=
      role === 'supervisee'
        ? " · the charge didn't go through; update your card and Gotham support will retry"
        : ' · approved; payment pending'
  } else {
    text += ' · approved'
  }
  return <p className="mt-1 text-xs italic text-muted-foreground">{text}</p>
}

function SessionRow({
  session,
  role,
  canEdit,
  isResponding,
  onEdit,
  onDelete,
  onRespond,
}: {
  session: HireSession
  role: HireBillingWeeks['role']
  canEdit: boolean
  isResponding: boolean
  onEdit: () => void
  onDelete: () => void
  onRespond: (approve: boolean) => void
}) {
  const rejected = session.approvalStatus === 'REJECTED'
  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="w-24 shrink-0">
        <p className="text-sm text-foreground">{formatCalendarDate(session.sessionDate)}</p>
        <p
          className={`text-xs tabular-nums text-muted-foreground ${rejected ? 'line-through' : ''}`}
        >
          {formatDuration(session.durationMinutes)}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
          {session.notes}
        </p>
        <LateSessionStatus
          session={session}
          role={role}
          isResponding={isResponding}
          onRespond={onRespond}
        />
      </div>
      {canEdit && session.source === 'SUPERVISOR' && (
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Edit session" onClick={onEdit}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Delete session" onClick={onDelete}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </li>
  )
}

/** A session the supervisor asked support to add to this closed week. */
function LateEntryRequestRow({ request }: { request: LateEntryRequest }) {
  const dismissed = request.status === 'DISMISSED'
  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="w-24 shrink-0">
        <p className="text-sm text-foreground">{formatCalendarDate(request.sessionDate)}</p>
        <p
          className={`text-xs tabular-nums text-muted-foreground ${dismissed ? 'line-through' : ''}`}
        >
          {formatDuration(request.durationMinutes)}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
          {request.notes}
        </p>
        <p className="mt-1 text-xs italic text-muted-foreground">
          {dismissed
            ? `Not added by Gotham support${request.resolutionNote ? ` · ${request.resolutionNote}` : ''}`
            : 'Sent to Gotham support · waiting to be added'}
        </p>
      </div>
    </li>
  )
}

/** One-line summary of an earlier week; click to open it in full. */
function CollapsedWeekRow({
  week,
  expanded,
  onToggle,
}: {
  week: BillingWeek
  expanded: boolean
  onToggle: () => void
}) {
  const badge = STATUS_BADGE[week.status]
  const hours =
    week.approvedMinutes != null && week.approvedMinutes !== week.loggedMinutes
      ? `${formatDuration(week.loggedMinutes)} logged · ${formatDuration(week.approvedMinutes)} approved`
      : formatDuration(week.loggedMinutes)
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors hover:bg-muted/40"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-foreground">
          {formatWeekRange(week.startDate, week.endDate)}
        </span>
        <Badge variant="outline" className={`${badge.className} hover:bg-[inherit]`}>
          {badge.label}
        </Badge>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground">
        {hours}
        <ChevronDown
          className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </span>
    </button>
  )
}

function isSuperviseePayment(payment: BillingWeek['payment']): payment is SuperviseeWeekPayment {
  return payment != null && 'totalCents' in payment
}

/** The week's money from the viewer's side: prepay, failure + Pay now, payout or refund. */
function PaymentLine({
  week,
  hasPaymentCard,
  counterpartName,
  isPaying,
  onPayNow,
  onChangeCard,
}: {
  week: BillingWeek
  hasPaymentCard: boolean
  counterpartName: string
  isPaying: boolean
  onPayNow: () => void
  onChangeCard?: () => void
}) {
  const payment = week.payment
  if (!payment) return null
  const settled = week.status === 'SETTLED'

  if (isSuperviseePayment(payment)) {
    const total = formatUsdCents(payment.totalCents)
    if (payment.unpaid) {
      return (
        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">
            {payment.prepayStatus === 'FAILED'
              ? "This week's payment didn't go through"
              : 'This week isn’t paid yet'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {payment.failureMessage ? `${payment.failureMessage} ` : ''}
            {hasPaymentCard
              ? `Pay the ${total} prepay so ${counterpartName} can be paid for this week.`
              : `Add a payment card to pay the ${total} prepay for this week.`}
          </p>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            {onChangeCard && (
              <Button variant="outline" size="sm" disabled={isPaying} onClick={onChangeCard}>
                <CreditCard className="size-3.5" aria-hidden />
                {hasPaymentCard ? 'Change Card' : 'Add Card'}
              </Button>
            )}
            {payment.canPayNow && (
              <Button size="sm" disabled={isPaying} onClick={onPayNow}>
                {isPaying ? 'Paying…' : `Pay now · ${total}`}
              </Button>
            )}
          </div>
        </div>
      )
    }
    let text: string | null = null
    if (settled && payment.prepayStatus === 'PAID') {
      text = payment.refundCents
        ? `Paid ${total} · ${formatUsdCents(payment.refundCents)} refunded for unused hours`
        : `Paid ${total}`
    } else if (payment.prepayStatus === 'PAID') {
      text = `Charged ${total}${payment.paidAt ? ` on ${formatEasternDate(payment.paidAt)}` : ''}; anything unused goes back to your card after the review.`
    } else if (payment.prepayStatus === 'PENDING') {
      text = `${total} prepay is charged on ${formatCalendarDate(payment.prepayDueDate)}.`
    } else if (payment.prepayStatus === 'CANCELED') {
      text = 'Nothing was charged for this week.'
    }
    return text ? <p className="mt-1 text-xs text-muted-foreground">{text}</p> : null
  }

  if (payment.unpaid) {
    return (
      <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Unpaid week — {counterpartName}&apos;s prepay hasn&apos;t gone through yet. You can keep
        logging sessions; you&apos;re paid for approved hours once the week is paid.
      </p>
    )
  }
  if (settled && payment.supervisorAmountCents) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">
        You were paid {formatUsdCents(payment.supervisorAmountCents)} (after the platform fee).
      </p>
    )
  }
  if (!settled && payment.prepayStatus === 'PAID') {
    return <p className="mt-1 text-xs text-muted-foreground">Prepaid by {counterpartName}.</p>
  }
  return null
}

function WeekCard({
  week,
  role,
  hourlyRateCents,
  payment,
  respondingSessionId,
  onEditSession,
  onDeleteSession,
  onRespondToLate,
  onApprove,
  onDispute,
}: {
  week: BillingWeek
  role: HireBillingWeeks['role']
  hourlyRateCents: number
  payment: React.ReactNode
  respondingSessionId: string | null
  onEditSession: (session: HireSession) => void
  onDeleteSession: (session: HireSession) => void
  onRespondToLate: (session: HireSession, approve: boolean) => void
  onApprove: () => void
  onDispute: () => void
}) {
  const badge = STATUS_BADGE[week.status]
  return (
    <section className="rounded-lg border px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground">
            {formatWeekRange(week.startDate, week.endDate)}
          </h4>
          <Badge variant="outline" className={`${badge.className} hover:bg-[inherit]`}>
            {badge.label}
          </Badge>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatDuration(week.loggedMinutes)} / {formatDuration(week.weeklyCapMinutes)}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{weekStatusText(week, role)}</p>
      {payment}
      {week.status === 'DISPUTED' && week.disputeReason && (
        <div className="mt-2 rounded-md bg-destructive/5 px-3 py-2 text-xs text-foreground">
          <p>
            <span className="font-medium">Reason:</span> {week.disputeReason}
          </p>
          <DisputeAttachmentThumbs attachments={week.disputeAttachments} />
        </div>
      )}

      {week.sessions.length > 0 ? (
        <ul className="mt-2 divide-y border-t">
          {week.sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              role={role}
              canEdit={week.canEditSessions}
              isResponding={respondingSessionId === session.id}
              onEdit={() => onEditSession(session)}
              onDelete={() => onDeleteSession(session)}
              onRespond={(approve) => onRespondToLate(session, approve)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-2 border-t pt-2.5 text-sm text-muted-foreground">No sessions logged.</p>
      )}

      {week.sessions.length > 0 && (
        <div className="mt-2 flex items-center justify-between gap-4 border-t pt-2.5 text-sm">
          <span className="font-medium text-foreground">Total this week</span>
          <span className="tabular-nums text-foreground">
            {formatDuration(week.loggedMinutes)}
            <span className="text-muted-foreground">
              {' '}
              · {formatUsdCents(Math.round((week.loggedMinutes / 60) * hourlyRateCents))}
            </span>
          </span>
        </div>
      )}

      {week.lateEntryRequests.length > 0 && (
        <div className="mt-2 border-t pt-2.5">
          <p className="text-xs font-medium text-foreground">Late entry requests</p>
          <ul className="divide-y">
            {week.lateEntryRequests.map((request) => (
              <LateEntryRequestRow key={request.id} request={request} />
            ))}
          </ul>
        </div>
      )}

      {week.canReview && (
        <div className="mt-3 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={onDispute}>
            Dispute
          </Button>
          <Button size="sm" onClick={onApprove}>
            Approve
          </Button>
        </div>
      )}
    </section>
  )
}

/**
 * Everything the sessions view does for one hourly hire — the billing weeks,
 * each week's card (pay now, approve, dispute, late entries, edit/delete
 * sessions) and the dialogs behind those actions — so the sessions dialog and
 * the hire workroom's timesheet share one implementation.
 */
export function useHireSessions({
  hireId,
  counterpartName,
  enabled,
  onChangeCard,
}: {
  hireId: string
  /** The other party: the supervisee for supervisors, the supervisor for supervisees. */
  counterpartName: string
  enabled: boolean
  /** Supervisee only: opens the payment dialog to add or change the prepay card. */
  onChangeCard?: () => void
}) {
  const { data, isLoading, isError, refetch } = useHireBillingWeeks(hireId, enabled)
  const { showSuccess, showError } = useUserSnackbar()
  const deleteMutation = useDeleteHireSession(hireId)
  const approveMutation = useApproveBillingWeek(hireId)
  const disputeMutation = useDisputeBillingWeek(hireId)
  const payNowMutation = usePayNowBillingWeek(hireId)
  const respondMutation = useRespondToLateSession(hireId)
  const [responding, setResponding] = useState<{ session: HireSession; approve: boolean } | null>(
    null,
  )
  const [payingWeekId, setPayingWeekId] = useState<string | null>(null)

  const [form, setForm] = useState<{ open: boolean; session?: HireSession }>({ open: false })
  const [deleting, setDeleting] = useState<HireSession | null>(null)
  const [approving, setApproving] = useState<BillingWeek | null>(null)
  const [lateEntryWeek, setLateEntryWeek] = useState<BillingWeek | null>(null)
  const [disputing, setDisputing] = useState<BillingWeek | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeFiles, setDisputeFiles] = useState<File[]>([])

  function handlePayNow(week: BillingWeek) {
    setPayingWeekId(week.id)
    payNowMutation.mutate(week.id, {
      onSuccess: () =>
        showSuccess('Payment complete', {
          description: `${formatWeekRange(week.startDate, week.endDate)} is paid.`,
        }),
      onError: (err) =>
        showError(err instanceof CardPaymentError ? err.message : parseApiError(err)),
      onSettled: () => setPayingWeekId(null),
    })
  }

  function handleRespond() {
    if (!responding) return
    const { session, approve } = responding
    respondMutation.mutate(
      { sessionId: session.id, approve },
      {
        onSuccess: () => {
          setResponding(null)
          showSuccess(approve ? 'Late session approved' : 'Late session rejected', {
            description: approve
              ? `${counterpartName} will be paid for it.`
              : 'Gotham support and your supervisor will be notified.',
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  function handleDelete() {
    if (!deleting) return
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null)
        showSuccess('Session deleted')
      },
      onError: (err) => showError(parseApiError(err)),
    })
  }

  function handleApprove() {
    if (!approving) return
    approveMutation.mutate(approving.id, {
      onSuccess: () => {
        setApproving(null)
        showSuccess('Week approved', {
          description: `Thanks! ${counterpartName} will be paid for the approved hours.`,
        })
      },
      onError: (err) => showError(parseApiError(err)),
    })
  }

  function handleDispute() {
    if (!disputing) return
    disputeMutation.mutate(
      { weekId: disputing.id, reason: disputeReason.trim(), attachments: disputeFiles },
      {
        onSuccess: () => {
          setDisputing(null)
          setDisputeReason('')
          setDisputeFiles([])
          showSuccess('Week disputed', {
            description:
              "Gotham support will review the week and contact you. It won't be paid until then.",
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  const olderWeeks = data?.weeks.slice(EXPANDED_WEEKS) ?? []

  const renderWeekCard = (week: BillingWeek) =>
    data ? (
      <WeekCard
        key={week.id}
        week={week}
        role={data.role}
        hourlyRateCents={data.terms.hourlyRateCents}
        payment={
          <PaymentLine
            week={week}
            hasPaymentCard={data.hasPaymentCard ?? false}
            counterpartName={counterpartName}
            isPaying={payingWeekId === week.id}
            onPayNow={() => handlePayNow(week)}
            onChangeCard={onChangeCard}
          />
        }
        respondingSessionId={respondMutation.isPending ? (responding?.session.id ?? null) : null}
        onRespondToLate={(session, approve) => setResponding({ session, approve })}
        onEditSession={(session) => setForm({ open: true, session })}
        onDeleteSession={setDeleting}
        onApprove={() => setApproving(week)}
        onDispute={() => setDisputing(week)}
      />
    ) : null

  const dialogs = (
    <>
      {data?.role === 'supervisor' && (
        <SessionFormDialog
          hireId={hireId}
          data={data}
          session={form.session}
          open={form.open}
          onOpenChange={(next) => setForm((prev) => ({ ...prev, open: next }))}
        />
      )}

      {lateEntryWeek && (
        <LateEntryRequestDialog
          hireId={hireId}
          week={lateEntryWeek}
          counterpartName={counterpartName}
          open
          onOpenChange={(next) => !next && setLateEntryWeek(null)}
        />
      )}

      <ConfirmDialog
        open={responding != null}
        onOpenChange={(next) => !next && setResponding(null)}
        title={
          responding
            ? `${responding.approve ? 'Approve' : 'Reject'} the ${formatDuration(responding.session.durationMinutes)} session on ${formatCalendarDate(responding.session.sessionDate)}?`
            : ''
        }
        description={
          responding?.approve
            ? `${counterpartName} is paid for it. If this week is already settled, your card is charged for these hours plus the service fee.`
            : `${counterpartName} isn't paid for it. Reject it only if the session didn't happen as described.`
        }
        confirmLabel={responding?.approve ? 'Approve' : 'Reject'}
        destructive={responding?.approve === false}
        isPending={respondMutation.isPending}
        onConfirm={handleRespond}
      />

      <ConfirmDialog
        open={deleting != null}
        onOpenChange={(next) => !next && setDeleting(null)}
        title="Delete this session?"
        description={
          deleting
            ? `${formatCalendarDate(deleting.sessionDate)} · ${formatDuration(deleting.durationMinutes)} will be removed from this week.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={approving != null}
        onOpenChange={(next) => !next && setApproving(null)}
        title={
          approving
            ? `Approve ${formatDuration(approving.loggedMinutes)} for ${formatWeekRange(approving.startDate, approving.endDate)}?`
            : ''
        }
        description={`${counterpartName} is paid for the approved hours, and anything unused goes back to your card. This can't be undone.`}
        confirmLabel="Approve"
        isPending={approveMutation.isPending}
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={disputing != null}
        onOpenChange={(next) => {
          if (!next) {
            setDisputing(null)
            setDisputeReason('')
            setDisputeFiles([])
          }
        }}
        title={
          disputing ? `Dispute ${formatWeekRange(disputing.startDate, disputing.endDate)}?` : ''
        }
        description="Tell us what's wrong with the logged sessions. The week isn't paid until Gotham support reviews it with you both."
        confirmLabel="Dispute week"
        destructive
        isPending={disputeMutation.isPending}
        confirmDisabled={disputeReason.trim().length < DISPUTE_REASON_MIN}
        onConfirm={handleDispute}
      >
        <Textarea
          rows={4}
          maxLength={1000}
          value={disputeReason}
          onChange={(e) => setDisputeReason(e.target.value)}
          placeholder="e.g. We only met for 30 minutes on Oct 14, not 1 hour."
          aria-label="Reason for the dispute"
          disabled={disputeMutation.isPending}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          At least {DISPUTE_REASON_MIN} characters.
        </p>
        <DisputeAttachmentsField
          files={disputeFiles}
          onChange={setDisputeFiles}
          disabled={disputeMutation.isPending}
        />
      </ConfirmDialog>
    </>
  )

  return {
    data,
    isLoading,
    isError,
    refetch,
    olderWeeks,
    renderWeekCard,
    dialogs,
    openLogForm: () => setForm({ open: true }),
    requestLateEntry: (week: BillingWeek) => setLateEntryWeek(week),
  }
}

/**
 * Sessions and weekly review for an hourly (in-app billed) hire. The supervisor
 * logs sessions while a week is open; the supervisee approves or disputes it
 * during the 3-day review.
 */
export function HireSessionsDialog({
  hireId,
  counterpartName,
  open,
  onOpenChange,
  onChangeCard,
}: {
  hireId: string
  /** The other party: the supervisee for supervisors, the supervisor for supervisees. */
  counterpartName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Supervisee only: opens the payment dialog to add or change the prepay card. */
  onChangeCard?: () => void
}) {
  const [showEarlier, setShowEarlier] = useState(false)
  const [openOlderIds, setOpenOlderIds] = useState<string[]>([])
  const {
    data,
    isLoading,
    isError,
    refetch,
    olderWeeks,
    renderWeekCard,
    dialogs,
    openLogForm,
    requestLateEntry,
  } = useHireSessions({
    hireId,
    counterpartName,
    enabled: open,
    // The payment dialog replaces this one.
    onChangeCard: onChangeCard
      ? () => {
          onOpenChange(false)
          onChangeCard()
        }
      : undefined,
  })

  return (
    <>
      <DialogRoot open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[min(90vh,820px)] max-w-2xl"
          header={
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle>Supervision Sessions</DialogTitle>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  With {counterpartName}
                </p>
              </div>
              {data?.canLog && (
                <Button size="sm" className="shrink-0" onClick={openLogForm}>
                  <Plus className="size-3.5" aria-hidden />
                  Log Session
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : isError || !data ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="size-4" aria-hidden />
                  We couldn&apos;t load the sessions.
                </p>
                <Button variant="outline" size="sm" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {data.role === 'supervisor' &&
                  !data.canLog &&
                  data.hasPaymentCard !== false &&
                  toEasternISODate() < data.terms.startDate && (
                    <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground">
                      <CalendarClock
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <p>
                        <span className="font-semibold">
                          Session logging opens on {formatCalendarDate(data.terms.startDate)}
                        </span>
                        , the agreement start date. The first weekly prepay is charged that day; you
                        can log sessions from then on.
                      </p>
                    </div>
                  )}
                {data.role === 'supervisor' &&
                  !data.canLog &&
                  data.hasPaymentCard !== false &&
                  toEasternISODate() >= data.terms.startDate &&
                  data.weeks[0] &&
                  data.weeks[0].status !== 'OPEN' && (
                    <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground">
                      <CalendarClock
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <p>
                        <span className="font-semibold">This week is closed for logging.</span>{' '}
                        Sessions for the next week can be logged starting{' '}
                        {formatCalendarDate(nextCalendarDay(data.weeks[0].endDate))}.
                        {canRequestLateEntry(data.weeks[0], data.role) && (
                          <>
                            {' '}
                            Forgot one?{' '}
                            <button
                              type="button"
                              onClick={() => requestLateEntry(data.weeks[0])}
                              className="font-medium text-primary hover:underline"
                            >
                              Request a late entry
                            </button>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}
                {data.hasPaymentCard === false && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <CreditCard className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                    <p>
                      {data.role === 'supervisor' ? (
                        <>
                          <span className="font-semibold">
                            {counterpartName} hasn&apos;t set up payment yet.
                          </span>{' '}
                          Billing weeks and session logging start once they save a card for the
                          weekly prepays. We&apos;ve reminded them.
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">
                            Set up payment to start supervision.
                          </span>{' '}
                          Billing weeks and session logging with {counterpartName} start once you
                          save a card. Use &ldquo;Set up payment&rdquo; on this supervisor&apos;s
                          card.
                        </>
                      )}
                    </p>
                  </div>
                )}
                <ProgressSummary data={data} />
                {data.weeks.length === 0 ? (
                  <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    {data.role === 'supervisor'
                      ? `No sessions yet. Log each session with ${counterpartName} after it happens.`
                      : `${counterpartName} hasn't logged any sessions yet. You'll review each week's sessions here.`}
                  </p>
                ) : (
                  <>
                    {data.weeks.slice(0, EXPANDED_WEEKS).map(renderWeekCard)}
                    {olderWeeks.length > 0 && (
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setShowEarlier((v) => !v)}
                        >
                          {showEarlier
                            ? 'Hide earlier weeks'
                            : `Show earlier weeks (${olderWeeks.length})`}
                        </Button>
                        {showEarlier &&
                          olderWeeks.map((week) => {
                            const expanded = openOlderIds.includes(week.id)
                            return (
                              <div key={week.id} className="space-y-2">
                                <CollapsedWeekRow
                                  week={week}
                                  expanded={expanded}
                                  onToggle={() =>
                                    setOpenOlderIds((ids) =>
                                      expanded
                                        ? ids.filter((id) => id !== week.id)
                                        : [...ids, week.id],
                                    )
                                  }
                                />
                                {expanded && renderWeekCard(week)}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </DialogRoot>

      {dialogs}
    </>
  )
}
