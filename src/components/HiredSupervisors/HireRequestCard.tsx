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
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { HIRE_LIST_GRID } from '@/components/HireList/HireListToolbar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import {
  formatDate,
  formatFeeAmount,
  formatLocation,
  formatSupervisionFormat,
} from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'
import type { Review } from '@/types/review'

import { AgreementStageBadge } from './AgreementStageBadge'
import { HireStatusBadge } from './HireStatusBadge'
import { useHireActions, workroomHref } from './useHireActions'

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
  // Deep link: agreement notifications/emails point to the hired list with
  // ?hire=<id>, which auto-opens this card's agreement dialog. Driven by the
  // router's search params (not window.location at mount) so clicking a
  // notification while already on this page opens the dialog too.
  const searchParams = useSearchParams()
  const deepLinkedHireId = searchParams.get('hire')
  const deepLinkMatches = hire.agreement != null && deepLinkedHireId === hire.id
  // Which deep-linked hire id the user has already closed the dialog for, so
  // the URL-driven open doesn't re-open it on the next render (derived state
  // instead of an effect + setState).
  const [dismissedDeepLinkId, setDismissedDeepLinkId] = useState<string | null>(null)
  // Sessions deep link (?sessions=<id>) works the same way on Hired Medical
  // Directors; on Hired Supervisors the list sends it to the hire's workroom.
  const deepLinkedSessionsId = searchParams.get('sessions')
  const [dismissedSessionsLinkId, setDismissedSessionsLinkId] = useState<string | null>(null)

  const actions = useHireActions(hire, {
    existingReview,
    isMedicalDirectors,
    agreementDeepLink: {
      open: deepLinkMatches && dismissedDeepLinkId !== deepLinkedHireId,
      onClose: () => {
        if (deepLinkMatches) setDismissedDeepLinkId(deepLinkedHireId)
      },
    },
    sessionsDeepLink: isMedicalDirectors
      ? {
          open:
            deepLinkedSessionsId === hire.id && dismissedSessionsLinkId !== deepLinkedSessionsId,
          onClose: () => {
            if (deepLinkedSessionsId === hire.id) setDismissedSessionsLinkId(deepLinkedSessionsId)
          },
        }
      : undefined,
  })
  const {
    supervisorName,
    profileHref,
    hasWorkroom,
    canSignAgreement,
    isAgreementSigned,
    needsPaymentSetup,
    hasSessions,
    openAgreement,
    openPayment,
    openSessions,
  } = actions
  // Name and photo open the hire's workroom (its profile is in the menu).
  const primaryHref = hasWorkroom ? workroomHref(hire.id) : profileHref

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

  const actionsMenu = actions.renderMenu('card')

  // Sessions open in the workroom's Timesheet tab, or the sessions dialog where there's no workroom.
  const sessionsButton = (size: 'sm') =>
    hasWorkroom ? (
      <Link
        href={workroomHref(hire.id, 'timesheet')}
        className={buttonVariants({ variant: 'outline', size })}
      >
        <CalendarClock className="size-3.5" aria-hidden />
        Sessions
      </Link>
    ) : (
      <Button variant="outline" size={size} onClick={openSessions}>
        <CalendarClock className="size-3.5" aria-hidden />
        Sessions
      </Button>
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
    <Button size="sm" onClick={openAgreement}>
      <FileSignature className="size-3.5" aria-hidden />
      Review &amp; Sign
    </Button>
  ) : needsPaymentSetup ? (
    <Button size="sm" onClick={() => openPayment()}>
      <CreditCard className="size-3.5" aria-hidden />
      Set up payment
    </Button>
  ) : hasSessions ? (
    sessionsButton('sm')
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
            href={primaryHref}
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
            hire.status === 'ACTIVE' && 'border-primary/40',
          )}
        >
          {/* Active supervision gets a green accent so it stands out from accepted-but-not-started. */}
          {hire.status === 'ACTIVE' && <div className="h-1 bg-primary" aria-hidden />}
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex min-w-0 flex-1 gap-3">
              <Link
                href={primaryHref}
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
                  href={primaryHref}
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
                onClick={openAgreement}
              >
                <FileSignature className="size-3.5" aria-hidden />
                Review &amp; Sign
              </Button>
            </div>
          )}

          {isAgreementSigned && (
            <div className="flex justify-end gap-2 border-t border-border/50 px-5 py-3">
              {hasSessions && sessionsButton('sm')}
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
              ) : hasWorkroom ? (
                <Link
                  href={workroomHref(hire.id, 'details')}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <FileText className="size-3.5" aria-hidden />
                  View Signed Agreement
                </Link>
              ) : (
                <Button variant="outline" size="sm" onClick={openAgreement}>
                  <FileText className="size-3.5" aria-hidden />
                  View Signed Agreement
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {actions.dialogs}
    </>
  )
}
