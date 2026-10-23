'use client'

import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  FileText,
  MapPin,
  Monitor,
  MoreVertical,
  Star,
  Target,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { AgreementDialog } from '@/components/HiredSupervisors/AgreementDialog'
import { AgreementStageBadge } from '@/components/HiredSupervisors/AgreementStageBadge'
import { HireStatusBadge } from '@/components/HiredSupervisors/HireStatusBadge'
import {
  HIRE_LIST_GRID,
  type HireListGroupFilter,
  HireListHeader,
  HireListNoResults,
  HireListToolbar,
  useDebouncedValue,
  useHireListView,
} from '@/components/HireList/HireListToolbar'
import { HireSessionsDialog } from '@/components/HireSessions/HireSessionsDialog'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenuItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import {
  useHiresList,
  useMyReviews,
  useRemindAgreement,
  useSuperviseeFormOptions,
  useUserSnackbar,
} from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { parseApiError } from '@/lib/utils/error-parser'
import {
  formatAvailability,
  formatContactNumber,
  formatDate,
  formatDateOnly,
  formatDisplayName,
  formatLocation,
  formatSupervisionFormat,
  formatSupervisionHours,
  resolveSupervisorTypeLabel,
} from '@/lib/utils/profile-formatters'
import { getAgreementStage, getAgreementStageLabel } from '@/lib/utils/supervision-status'
import type { HireListItem } from '@/types/hire'
import type { Review } from '@/types/review'

import { SendAgreementModal } from './SendAgreementModal'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// Pending requests are handled (accepted/declined) on Supervision Requests, so
// this page doesn't offer a Pending filter.
type SuperviseeListGroup = Exclude<HireListGroupFilter, 'pending'>

const SUPERVISEE_LIST_GROUPS: readonly SuperviseeListGroup[] = [
  'all',
  'needs_action',
  'active',
  'completed',
  'closed',
]

// ─── Detail cell ──────────────────────────────────────────────────────────────

function DetailCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
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

function SuperviseesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
          <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-5">
            <div className="flex min-w-0 gap-3">
              <Skeleton className="mt-0.5 size-11 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-full max-w-[14rem]" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Skeleton className="h-6 w-20 rounded-full" />
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function SuperviseesEmpty({
  group,
  isMdClients,
}: {
  group: SuperviseeListGroup
  isMdClients: boolean
}) {
  const messages: Record<SuperviseeListGroup, { title: string; body: string }> = isMdClients
    ? {
        all: {
          title: 'No medical director clients yet',
          body: 'Once someone hires you as their Medical Director and you accept, they will appear here.',
        },
        needs_action: {
          title: "You're all caught up",
          body: 'Accepted clients still waiting for an agreement from you will appear here.',
        },
        active: {
          title: 'No active clients',
          body: 'Clients whose requests you have accepted, including engagements in progress, will appear here.',
        },
        completed: {
          title: 'No completed engagements',
          body: 'Engagements that have been marked as completed will appear here.',
        },
        closed: {
          title: 'No closed requests',
          body: 'Requests that were declined or canceled will appear here.',
        },
      }
    : {
        all: {
          title: 'No supervisees yet',
          body: 'Once supervisees request your supervision and you accept, they will appear here.',
        },
        needs_action: {
          title: "You're all caught up",
          body: 'Accepted supervisees still waiting for an agreement from you will appear here.',
        },
        active: {
          title: 'No active supervisees',
          body: 'Supervisees whose requests you have accepted, including supervision in progress, will appear here.',
        },
        completed: {
          title: 'No completed supervisions',
          body: 'Supervisions that have been marked as completed will appear here.',
        },
        closed: {
          title: 'No closed requests',
          body: 'Requests that were declined or canceled will appear here.',
        },
      }
  const { title, body } = messages[group]

  return (
    <Card className="border-dashed shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Users className="size-7 text-primary" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground/80">{body}</p>
      </div>
    </Card>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function SuperviseesError() {
  return (
    <Card className="border-destructive/25 bg-destructive/5 shadow-sm">
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" aria-hidden />
        </div>
        <p className="text-base font-semibold text-foreground">Failed to load supervisees</p>
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

// ─── Details dialog ───────────────────────────────────────────────────────────

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

function SuperviseeDetailsDialog({
  hire,
  review,
  open,
  onOpenChange,
}: {
  hire: HireListItem
  review?: Review
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { supervisorTypes } = useSuperviseeFormOptions()
  const supervisorTypeOptions = supervisorTypes.data ?? []
  const { supervisee } = hire
  const occupation = supervisee.occupation?.name
  const specialty = supervisee.specialty?.name
  const location = formatLocation(supervisee.city, supervisee.state, supervisee.zipcode)
  const licensureStates = supervisee.stateOfLicensure?.length
    ? supervisee.stateOfLicensure.join(', ')
    : null
  // All needs on the profile — the hire itself only records the role hired for.
  const profileNeeds = resolveSupervisorTypeLabel(
    supervisee.superviseeProfile?.typeOfSupervisorNeeded,
    supervisorTypeOptions,
  )

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Supervisee Details</DialogTitle>

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
            {profileNeeds !== 'N/A' && (
              <DetailItem label="Supervision Needs" value={profileNeeds} />
            )}
          </dl>
        </section>

        <div className="my-5 border-t" />

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Supervision Details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <DetailItem label="Format" value={formatSupervisionFormat(hire.preferredFormat)} />
            <DetailItem
              label="Availability"
              value={formatAvailability(hire.preferredAvailability)}
            />
            <DetailItem
              label="Start Date"
              value={formatDateOnly(hire.startDate ?? hire.preferredStartDate)}
            />
            {hire.supervisionHours != null && (
              <DetailItem
                label="Supervision Hours Needed"
                value={formatSupervisionHours(hire.supervisionHours)}
              />
            )}
            <DetailItem
              label="Status"
              value={<HireStatusBadge status={hire.status} completedAt={hire.completedAt} />}
            />
            {hire.agreement && (
              <DetailItem
                label="Agreement"
                value={getAgreementStageLabel(getAgreementStage(hire))}
              />
            )}
          </dl>
        </section>

        <div className="my-5 border-t" />

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Message & Goals</h3>
          <dl className="space-y-4">
            <DetailBlock label="Intro Message" value={hire.introMessage} />
            <DetailBlock label="Goals" value={hire.goals} />
          </dl>
        </section>

        {review && (
          <>
            <div className="my-5 border-t" />
            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Supervisee Review</h3>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-muted text-muted'
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{review.rating}/5</span>
                <span className="text-xs text-muted-foreground">
                  · {formatDate(review.createdAt)}
                </span>
              </div>
              <dl>
                <DetailBlock label="Comment" value={review.comment} />
              </dl>
            </section>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function RowActions({
  hire,
  review,
  onViewAgreement,
  onSendAgreement,
}: {
  hire: HireListItem
  review?: Review
  onViewAgreement: () => void
  onSendAgreement: () => void
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { showSuccess, showError } = useUserSnackbar()
  const remindMutation = useRemindAgreement()

  const agreementStage = getAgreementStage(hire)
  const canSendAgreement = hire.status === 'ACCEPTED' && agreementStage === 'NOT_SENT'
  const canEditAgreement = hire.status === 'ACCEPTED' && agreementStage === 'AWAITING_SIGNATURE'
  const hasAgreement = hire.agreement != null

  function handleRemind() {
    remindMutation.mutate(hire.id, {
      onSuccess: () =>
        showSuccess('Reminder sent!', {
          description: `${formatDisplayName(hire.supervisee)} will be notified to sign the agreement.`,
        }),
      onError: (err) => showError(parseApiError(err)),
    })
  }

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Row actions">
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuPopup>
              <DropdownMenuItem onClick={() => setDetailsOpen(true)}>View Details</DropdownMenuItem>
              {canSendAgreement && (
                <DropdownMenuItem onClick={onSendAgreement}>Send Agreement</DropdownMenuItem>
              )}
              {canEditAgreement && (
                <DropdownMenuItem onClick={onSendAgreement}>Edit Agreement</DropdownMenuItem>
              )}
              {canEditAgreement && (
                <DropdownMenuItem onClick={handleRemind}>Send Sign Reminder</DropdownMenuItem>
              )}
              {hasAgreement && (
                <DropdownMenuItem onClick={onViewAgreement}>View Agreement</DropdownMenuItem>
              )}
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <SuperviseeDetailsDialog
        hire={hire}
        review={review}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
}

/** Deep link from the post-accept dialog: /supervisees?hire=<id>&agreement=send */
const SEND_AGREEMENT_PARAM = 'agreement'
const SEND_AGREEMENT_VALUE = 'send'

function isSendAgreementDeepLink(hireId: string): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('hire') === hireId && params.get(SEND_AGREEMENT_PARAM) === SEND_AGREEMENT_VALUE
}

/** Drop the one-shot deep-link params so a refresh doesn't reopen the form. */
function clearSendAgreementDeepLink() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (url.searchParams.get(SEND_AGREEMENT_PARAM) !== SEND_AGREEMENT_VALUE) return
  url.searchParams.delete(SEND_AGREEMENT_PARAM)
  url.searchParams.delete('hire')
  window.history.replaceState(window.history.state, '', url.toString())
}

// ─── Supervisee card ──────────────────────────────────────────────────────────

function SuperviseeCard({
  hire,
  review,
  layout = 'card',
}: {
  hire: HireListItem
  review?: Review
  /** 'list' renders a compact row (inside a list container) instead of a card. */
  layout?: 'card' | 'list'
}) {
  // Deep link: agreement notifications/emails point to /supervisees?hire=<id>,
  // which auto-opens this card's agreement dialog. Lazy init only (no effect); the
  // dialog renders in a portal, so SSR/hydration output is unaffected.
  const [viewAgreementOpen, setViewAgreementOpen] = useState(
    () =>
      hire.agreement != null &&
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('hire') === hire.id,
  )
  const superviseeName = formatDisplayName(hire.supervisee)
  const hasAgreement = hire.agreement != null
  const agreementStage = getAgreementStage(hire)
  const isAgreementSigned = hasAgreement && agreementStage === 'SIGNED'
  const canSendAgreement = hire.status === 'ACCEPTED' && agreementStage === 'NOT_SENT'
  const canEditAgreement = hire.status === 'ACCEPTED' && agreementStage === 'AWAITING_SIGNATURE'
  // Deep link from the post-accept dialog (?hire=<id>&agreement=send) opens the
  // Send Agreement form straight away. Lazy init only, like the dialogs above.
  const [sendAgreementOpen, setSendAgreementOpen] = useState(
    () => canSendAgreement && isSendAgreementDeepLink(hire.id),
  )

  function handleSendAgreementOpenChange(open: boolean) {
    setSendAgreementOpen(open)
    if (!open) clearSendAgreementDeepLink()
  }
  // Signed hourly agreement: the supervisor logs sessions in the app.
  const hasSessions =
    IN_APP_PAYMENTS_ENABLED && isAgreementSigned && hire.agreement?.hourlyRateCents != null
  // Signed, but the supervisee hasn't saved a card: no billing weeks until they do.
  const awaitingPaymentSetup = hasSessions && hire.paymentMethodSavedAt == null
  // Deep link: session notifications point to /supervisees?sessions=<id> (lazy init, as above).
  const [sessionsOpen, setSessionsOpen] = useState(
    () =>
      hasSessions &&
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('sessions') === hire.id,
  )
  const occupation = hire.supervisee.occupation?.name?.trim()
  const specialty = hire.supervisee.specialty?.name?.trim()
  const occupationDisplay =
    occupation && specialty
      ? `${occupation} · ${specialty}`
      : (occupation ?? specialty ?? 'Not specified')

  const locationRaw = formatLocation(hire.supervisee.city, hire.supervisee.state)
  const formatRaw = formatSupervisionFormat(hire.preferredFormat)
  const startDateRaw = formatDateOnly(hire.startDate ?? hire.preferredStartDate)
  const goalsRaw = hire.goals?.trim() || 'Not specified'

  const actionsMenu = (
    <RowActions
      hire={hire}
      review={review}
      onViewAgreement={() => setViewAgreementOpen(true)}
      onSendAgreement={() => setSendAgreementOpen(true)}
    />
  )

  const badges = (
    <>
      <HireStatusBadge status={hire.status} completedAt={hire.completedAt} />
      <AgreementStageBadge hire={hire} />
      {awaitingPaymentSetup && (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50"
        >
          Payment not set up
        </Badge>
      )}
      {review && (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
          <Star className="size-2.5 fill-amber-500 text-amber-500" aria-hidden />
          {review.rating}/5
        </span>
      )}
    </>
  )

  // List rows show the one action that matters most right now; the rest stay in the menu.
  const rowAction = canSendAgreement ? (
    <Button size="sm" onClick={() => setSendAgreementOpen(true)}>
      <FileSignature className="size-3.5" aria-hidden />
      Send Agreement
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
            canSendAgreement && 'bg-amber-50/60',
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              src={hire.supervisee.profilePhotoUrl}
              name={superviseeName}
              alt={`Profile photo of ${superviseeName}`}
              size="md"
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{superviseeName}</p>
              <p className="truncate text-xs text-muted-foreground">{occupationDisplay}</p>
              <p className="truncate text-xs text-muted-foreground lg:hidden">
                {formatRaw} · Starts {startDateRaw}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
          <p className="hidden truncate text-sm text-foreground lg:block">{formatRaw}</p>
          <p className="hidden truncate text-sm text-foreground lg:block">{startDateRaw}</p>
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
                <div className="mt-2 flex flex-wrap items-center gap-2">{badges}</div>
              </div>
            </div>
            <div className="flex shrink-0 self-start">{actionsMenu}</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 px-5 py-4">
            <DetailCell label="Format" value={formatRaw} icon={Monitor} />
            <DetailCell label="Start Date" value={startDateRaw} icon={CalendarDays} />
            <DetailCell label="Location" value={locationRaw} icon={MapPin} />
            <DetailCell label="Goals" value={goalsRaw} icon={Target} />
          </div>

          {canSendAgreement && (
            <div className="flex flex-col gap-3 border-t border-amber-200 bg-amber-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <FileSignature className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Send an agreement to start supervision.</span>{' '}
                  Supervision doesn&apos;t begin until {superviseeName} signs.
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 self-stretch sm:self-center"
                onClick={() => setSendAgreementOpen(true)}
              >
                <FileSignature className="size-3.5" aria-hidden />
                Send Agreement
              </Button>
            </div>
          )}

          {isAgreementSigned && (
            <div className="flex justify-end gap-2 border-t border-border/50 px-5 py-3">
              {hasSessions && (
                <Button size="sm" onClick={() => setSessionsOpen(true)}>
                  <CalendarClock className="size-3.5" aria-hidden />
                  Sessions
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
                <Button variant="outline" size="sm" onClick={() => setViewAgreementOpen(true)}>
                  <FileText className="size-3.5" aria-hidden />
                  View Signed Agreement
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {hasAgreement && (
        <AgreementDialog hire={hire} open={viewAgreementOpen} onOpenChange={setViewAgreementOpen} />
      )}

      {(canSendAgreement || canEditAgreement) && (
        <SendAgreementModal
          open={sendAgreementOpen}
          onOpenChange={handleSendAgreementOpenChange}
          hire={hire}
        />
      )}

      {hasSessions && (
        <HireSessionsDialog
          hireId={hire.id}
          counterpartName={superviseeName}
          open={sessionsOpen}
          onOpenChange={setSessionsOpen}
        />
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export type SuperviseesPageMode = 'supervisors' | 'medical-directors'

export function SuperviseesPage({ mode = 'supervisors' }: { mode?: SuperviseesPageMode }) {
  const isMdClients = mode === 'medical-directors'
  // Opens on Active, as before the filters existed: the current supervision work.
  const [group, setGroup] = useState<SuperviseeListGroup>('active')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [view, setView] = useHireListView(
    isMdClients ? 'medical-director-clients:view' : 'supervisees:view',
  )
  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading, isError } = useHiresList(
    page,
    PAGE_SIZE,
    undefined,
    // Scoped by the role they hired this supervisor for (hire snapshot)
    isMdClients ? 'medicalDirectors' : 'supervisors',
    {
      search: debouncedSearch,
      group: group === 'all' ? undefined : group,
      // Requests awaiting a decision live on Supervision Requests (Accept/Decline).
      excludePending: true,
    },
  )
  // Reviews received by the authenticated supervisor (role-scoped on the backend),
  // joined to hires client-side — same pattern as the supervisee's /hired-supervisors page.
  const { data: reviewsData } = useMyReviews(0)

  const reviewsByHireId = useMemo(
    () =>
      new Map<string, Review>(
        (reviewsData?.items ?? [])
          .filter((r): r is Review & { hireId: string } => r.hireId !== null)
          .map((r) => [r.hireId, r]),
      ),
    [reviewsData?.items],
  )

  const items = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const isSearching = debouncedSearch.trim() !== ''

  function handleGroupChange(next: SuperviseeListGroup) {
    setGroup(next)
    setPage(1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setGroup('all')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {isMdClients ? 'Medical Director Clients' : 'My Supervisees'}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {isMdClients
            ? 'Clients you’ve accepted as their Medical Director are listed here, including completed and closed engagements. New requests are on Supervision Requests. Search by name or filter by status, and open the menu on any client to view full profile and engagement details.'
            : 'Supervisees you’ve accepted are listed here, including completed and closed supervisions. New requests are on Supervision Requests. Search by name or filter by status, and open the menu on any supervisee to view full profile and supervision details.'}
        </p>
      </div>

      <HireListToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={isMdClients ? 'Search clients by name' : 'Search supervisees by name'}
        group={group}
        onGroupChange={(next) => handleGroupChange(next as SuperviseeListGroup)}
        groups={SUPERVISEE_LIST_GROUPS}
        view={view}
        onViewChange={setView}
        groupLabel={isMdClients ? 'Filter clients by status' : 'Filter supervisees by status'}
      />

      {/* ── Content ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <SuperviseesSkeleton />
      ) : isError ? (
        <SuperviseesError />
      ) : items.length === 0 ? (
        isSearching ? (
          <HireListNoResults onClear={clearFilters} />
        ) : (
          <SuperviseesEmpty group={group} isMdClients={isMdClients} />
        )
      ) : (
        <>
          {view === 'list' ? (
            <Card className="gap-0 divide-y divide-border/60 overflow-hidden rounded-xl py-0 shadow-sm">
              <HireListHeader detailLabel="Format" dateLabel="Start date" />
              {items.map((hire) => (
                <SuperviseeCard
                  key={hire.id}
                  hire={hire}
                  review={reviewsByHireId.get(hire.id)}
                  layout="list"
                />
              ))}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((hire) => (
                <SuperviseeCard key={hire.id} hire={hire} review={reviewsByHireId.get(hire.id)} />
              ))}
            </div>
          )}

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
