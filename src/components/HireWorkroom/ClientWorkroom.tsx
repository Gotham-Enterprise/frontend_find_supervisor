'use client'

import {
  AlertCircle,
  CalendarClock,
  ChevronLeft,
  CreditCard,
  FileSignature,
  MapPin,
  MoreVertical,
  NotebookPen,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { ActivityLogPanel } from '@/components/ActivityLog/ActivityLogPanel'
import { AgreementBody, AgreementDialog } from '@/components/HiredSupervisors/AgreementDialog'
import { AgreementStageBadge } from '@/components/HiredSupervisors/AgreementStageBadge'
import { HireRequestDetailsBody } from '@/components/HiredSupervisors/HireRequestDetailsDialog'
import { HireStatusBadge } from '@/components/HiredSupervisors/HireStatusBadge'
import { MonthlyBillingPanel } from '@/components/MonthlyBilling/MonthlyBillingDialog'
import { EndSupervisionDialog } from '@/components/Supervisees/EndSupervisionDialog'
import { SendAgreementModal } from '@/components/Supervisees/SendAgreementModal'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { ACTIVITY_LOG_ENABLED } from '@/lib/constants/feature-flags'
import { useHire, useRemindAgreement, useUserSnackbar } from '@/lib/hooks'
import { useHireActivityLog } from '@/lib/hooks/useActivityLog'
import { useHireMonthlyBilling } from '@/lib/hooks/useMonthlyBilling'
import { cn } from '@/lib/utils'
import { parseApiError } from '@/lib/utils/error-parser'
import { hiredListPath } from '@/lib/utils/hire-workroom'
import { formatUsdCents } from '@/lib/utils/money'
import { usesInAppMonthlyBilling } from '@/lib/utils/monthly-billing'
import {
  formatDate,
  formatDateOnly,
  formatDisplayName,
  formatLocation,
} from '@/lib/utils/profile-formatters'
import { getAgreementStage } from '@/lib/utils/supervision-status'
import type { HireListItem } from '@/types/hire'

import { WorkroomMessages } from './WorkroomMessages'
import { Banner } from './WorkroomOverview'

/** The Medical Director's list page; the workroom lives under it. */
export const MD_CLIENTS_PATH = '/medical-director-clients'

export const clientWorkroomPath = (hireId: string, tab?: ClientWorkroomTab) =>
  `${MD_CLIENTS_PATH}/${hireId}${tab && tab !== 'overview' ? `?tab=${tab}` : ''}`

type ClientWorkroomTab = 'overview' | 'billing' | 'activity' | 'messages' | 'contract'

const TABS: { id: ClientWorkroomTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'billing', label: 'Billing' },
  { id: 'activity', label: 'Activity' },
  { id: 'messages', label: 'Messages' },
  { id: 'contract', label: 'Contract details' },
]

/**
 * The Medical Director's side of one client engagement: what needs doing,
 * the months and payouts, the activity log, messages and the contract — the
 * counterpart of the client's /hired-medical-directors/[hireId] workroom.
 * Only Medical Director hires come here; anything else goes back to the list.
 */
export function ClientWorkroomPage({ hireId }: { hireId: string }) {
  const router = useRouter()
  const { data: hire, isLoading, isError } = useHire(hireId)
  const isMedicalDirectorHire = hire ? hiredListPath(hire) === '/hired-medical-directors' : null

  if (hire && isMedicalDirectorHire === false) {
    router.replace(MD_CLIENTS_PATH)
    return null
  }
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }
  if (isError || !hire) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          <AlertCircle className="size-4" aria-hidden />
          We couldn&apos;t load this client. They may no longer be on your list.
        </div>
      </div>
    )
  }
  return <ClientWorkroom hire={hire} />
}

function BackLink() {
  return (
    <Link
      href={MD_CLIENTS_PATH}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="size-4" aria-hidden />
      Medical Director Clients
    </Link>
  )
}

function ClientWorkroom({ hire }: { hire: HireListItem }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showSuccess, showError } = useUserSnackbar()
  const remindMutation = useRemindAgreement()

  const clientName = formatDisplayName(hire.supervisee)
  const location = formatLocation(hire.supervisee.city, hire.supervisee.state)
  const agreementStage = getAgreementStage(hire)
  const isOpen = hire.status === 'ACCEPTED' || hire.status === 'ACTIVE'
  const isSigned = hire.agreement != null && agreementStage === 'SIGNED'
  const canSendAgreement = hire.status === 'ACCEPTED' && agreementStage === 'NOT_SENT'
  const canEditAgreement = hire.status === 'ACCEPTED' && agreementStage === 'AWAITING_SIGNATURE'
  const monthlyBilled = usesInAppMonthlyBilling(hire)
  const hasBilling = monthlyBilled && isSigned
  const hasActivity = ACTIVITY_LOG_ENABLED && isSigned
  // Ended by one side already (it runs out with its paid month); a fixed
  // term's own end date can still be cut short.
  const endScheduled = hire.scheduledEndAt != null && hire.scheduledEndBy !== 'TERM'
  const canEnd = isOpen && !endScheduled

  const tabs = TABS.filter(
    (tab) => (tab.id !== 'billing' || hasBilling) && (tab.id !== 'activity' || hasActivity),
  )
  const requested = searchParams.get('tab') as ClientWorkroomTab | null
  const activeTab: ClientWorkroomTab =
    requested && tabs.some((t) => t.id === requested) ? requested : 'overview'
  const selectTab = (tab: ClientWorkroomTab) =>
    router.replace(tab === 'overview' ? pathname : `${pathname}?tab=${tab}`, { scroll: false })

  const [sendOpen, setSendOpen] = useState(false)
  const [viewAgreementOpen, setViewAgreementOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  function handleRemind() {
    remindMutation.mutate(hire.id, {
      onSuccess: () =>
        showSuccess('Reminder sent!', {
          description: `${clientName} will be notified to sign the agreement.`,
        }),
      onError: (err) => showError(parseApiError(err)),
    })
  }

  return (
    <div className="space-y-6">
      <BackLink />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-primary py-0 text-primary-foreground">
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar
              src={hire.supervisee.profilePhotoUrl}
              name={clientName}
              alt={`Profile photo of ${clientName}`}
              size="xl"
              showPresence
              userId={hire.superviseeId}
              presenceRingClassName="ring-primary"
              presenceDotClassName="bottom-1 right-1 size-3.5 translate-x-0 translate-y-0"
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {clientName}
              </h1>
              {hire.supervisee.occupation?.name && (
                <p className="mt-0.5 truncate text-sm opacity-80">
                  {hire.supervisee.occupation.name}
                </p>
              )}
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-80">
                {location && location !== 'N/A' && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden />
                    {location}
                  </span>
                )}
                <span>Requested {formatDate(hire.createdAt)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <HireStatusBadge status={hire.status} completedAt={hire.completedAt} onPrimary />
                <AgreementStageBadge hire={hire} />
              </div>
            </div>
          </div>
          <div className="shrink-0 [&>button:hover]:bg-white/15 [&>button]:text-primary-foreground">
            <DropdownMenuRoot>
              <DropdownMenuTrigger
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                aria-label="More actions"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuPositioner align="end">
                  <DropdownMenuPopup>
                    {canSendAgreement && (
                      <DropdownMenuItem onClick={() => setSendOpen(true)}>
                        Send Agreement
                      </DropdownMenuItem>
                    )}
                    {canEditAgreement && (
                      <>
                        <DropdownMenuItem onClick={() => setSendOpen(true)}>
                          Edit Agreement
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleRemind}>
                          Send Sign Reminder
                        </DropdownMenuItem>
                      </>
                    )}
                    {hire.agreement != null && (
                      <DropdownMenuItem onClick={() => setViewAgreementOpen(true)}>
                        View Agreement
                      </DropdownMenuItem>
                    )}
                    {canEnd && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => setEndOpen(true)}>
                          End Supervision
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuPopup>
                </DropdownMenuPositioner>
              </DropdownMenuPortal>
            </DropdownMenuRoot>
          </div>
        </div>

        <div
          className="overflow-x-auto border-t border-white/15 px-6"
          role="tablist"
          aria-label="Workroom sections"
        >
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const selected = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectTab(tab.id)}
                  className={cn(
                    'relative whitespace-nowrap rounded-t-sm border-0 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60',
                    selected ? 'text-white' : 'text-white/70 hover:text-white',
                  )}
                >
                  {tab.label}
                  {selected && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-white" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <ClientOverview
          hire={hire}
          clientName={clientName}
          hasBilling={hasBilling}
          hasActivity={hasActivity}
          canSendAgreement={canSendAgreement}
          canEditAgreement={canEditAgreement}
          onSendAgreement={() => setSendOpen(true)}
          onRemind={handleRemind}
          onEnd={() => setEndOpen(true)}
          onTab={selectTab}
        />
      )}
      {activeTab === 'billing' && hasBilling && (
        <div className="rounded-xl border bg-card p-6">
          <MonthlyBillingPanel
            hireId={hire.id}
            counterpartName={clientName}
            onEndSupervision={() => setEndOpen(true)}
          />
        </div>
      )}
      {activeTab === 'activity' && hasActivity && (
        <div className="rounded-xl border bg-card p-6">
          <ActivityLogPanel hireId={hire.id} counterpartName={clientName} />
        </div>
      )}
      {activeTab === 'messages' && <WorkroomMessages hire={hire} />}
      {activeTab === 'contract' && (
        <div className="space-y-6">
          {hire.agreement != null ? (
            <div className="rounded-xl border bg-card p-6">
              <AgreementBody hire={hire} />
            </div>
          ) : (
            <Banner
              tone="muted"
              icon={<FileSignature className="size-4 text-muted-foreground" aria-hidden />}
            >
              No agreement yet.
              {canSendAgreement && ' Send one from the Overview tab or the menu above.'}
            </Banner>
          )}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              The client&apos;s request
            </h2>
            <HireRequestDetailsBody hire={hire} showStatus={false} wide />
          </div>
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      {(canSendAgreement || canEditAgreement) && (
        <SendAgreementModal open={sendOpen} onOpenChange={setSendOpen} hire={hire} />
      )}
      {hire.agreement != null && (
        <AgreementDialog hire={hire} open={viewAgreementOpen} onOpenChange={setViewAgreementOpen} />
      )}
      {canEnd && <EndSupervisionDialog hire={hire} open={endOpen} onOpenChange={setEndOpen} />}
    </div>
  )
}

/**
 * What the Medical Director needs to do now, then the money at a glance.
 * Each nudge opens the tab (or dialog) where it's done.
 */
function ClientOverview({
  hire,
  clientName,
  hasBilling,
  hasActivity,
  canSendAgreement,
  canEditAgreement,
  onSendAgreement,
  onRemind,
  onEnd,
  onTab,
}: {
  hire: HireListItem
  clientName: string
  hasBilling: boolean
  hasActivity: boolean
  canSendAgreement: boolean
  canEditAgreement: boolean
  onSendAgreement: () => void
  onRemind: () => void
  onEnd: () => void
  onTab: (tab: ClientWorkroomTab) => void
}) {
  const { data: billing } = useHireMonthlyBilling(hire.id, hasBilling)
  const { data: activity } = useHireActivityLog(hire.id, hasActivity)

  const runningMonth = billing?.periods.find(
    (p) => p.status === 'OPEN' && p.paymentStatus === 'PAID',
  )
  const disputedMonth = billing?.periods.find((p) => p.status === 'DISPUTED')
  const nothingLoggedThisMonth =
    runningMonth != null &&
    activity != null &&
    !activity.entries.some((entry) => entry.periodId === runningMonth.id)
  const ended = hire.status === 'COMPLETED' || hire.status === 'CANCELED'
  const quote = billing?.quote
  const youReceiveCents =
    quote?.supervisorMonthlyCents ??
    (quote ? quote.monthlyAmountCents - (quote.platformFeeCents ?? 0) : null)
  const paidMonths = billing?.periods.filter((p) => p.paymentStatus === 'PAID').length ?? 0
  const termMonths = billing?.terms.supervisionMonths ?? null

  return (
    <div className="space-y-4">
      {canSendAgreement && (
        <Banner
          tone="amber"
          icon={<FileSignature className="size-4 text-amber-600" aria-hidden />}
          action={
            <Button size="sm" onClick={onSendAgreement}>
              Send Agreement
            </Button>
          }
        >
          <span className="font-semibold">Send {clientName} the agreement.</span> Supervision and
          billing start once they add a card and sign it.
        </Banner>
      )}
      {canEditAgreement && (
        <Banner
          tone="amber"
          icon={<FileSignature className="size-4 text-amber-600" aria-hidden />}
          action={
            <span className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSendAgreement}>
                Edit Agreement
              </Button>
              <Button size="sm" onClick={onRemind}>
                Send Sign Reminder
              </Button>
            </span>
          }
        >
          <span className="font-semibold">Waiting for {clientName} to sign.</span> You can still
          change the terms until they do.
        </Banner>
      )}
      {hasBilling && billing?.paymentStatus === 'awaiting_card' && !ended && (
        <Banner
          tone="muted"
          icon={<CreditCard className="size-4 text-muted-foreground" aria-hidden />}
        >
          <span className="font-semibold">Waiting for {clientName} to add a card.</span> The first
          month is charged as soon as they do.
        </Banner>
      )}
      {billing?.unpaid && !ended && (
        <Banner
          tone="red"
          icon={<AlertCircle className="size-4 text-destructive" aria-hidden />}
          action={
            billing.canEndForNonPayment ? (
              <Button variant="destructive" size="sm" onClick={onEnd}>
                End Supervision
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => onTab('billing')}>
                View Billing
              </Button>
            )
          }
        >
          <span className="font-semibold">This month&apos;s payment didn&apos;t go through.</span>{' '}
          {billing.unpaid.graceOver
            ? 'The 7-day grace period is over; you can end the supervision if it stays unpaid.'
            : billing.unpaid.graceEndsAt
              ? `${clientName} has until ${formatDate(billing.unpaid.graceEndsAt)} to pay.`
              : `${clientName} has been asked to pay.`}
        </Banner>
      )}
      {disputedMonth && (
        <Banner
          tone="amber"
          icon={<AlertCircle className="size-4 text-amber-600" aria-hidden />}
          action={
            <Button size="sm" onClick={() => onTab('billing')}>
              Add Your Side
            </Button>
          }
        >
          <span className="font-semibold">
            {clientName} reported a problem with {disputedMonth.label}.
          </span>{' '}
          The payment is on hold while Gotham support reviews it; no new month is charged until
          it&apos;s resolved.
        </Banner>
      )}
      {nothingLoggedThisMonth && !ended && (
        <Banner
          tone="muted"
          icon={<NotebookPen className="size-4 text-muted-foreground" aria-hidden />}
          action={
            <Button variant="outline" size="sm" onClick={() => onTab('activity')}>
              Log Activity
            </Button>
          }
        >
          <span className="font-semibold">Nothing logged yet for {runningMonth.label}.</span> Your
          meetings, chart reviews and protocol sign-offs are the client&apos;s compliance record —
          and your side of the story if the month is disputed.
        </Banner>
      )}
      {billing?.scheduledEnd && !ended && (
        <Banner tone="amber" icon={<CalendarClock className="size-4 text-amber-600" aria-hidden />}>
          {billing.scheduledEnd.by === 'TERM'
            ? `The agreement ends after ${formatDateOnly(billing.scheduledEnd.lastDay)}, when its last month runs out.`
            : `Supervision ends after ${formatDateOnly(billing.scheduledEnd.lastDay)}, the end of the month already paid for.`}
        </Banner>
      )}

      {hasBilling && billing && (
        <div className="grid grid-cols-1 gap-6 rounded-xl border bg-card px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="You receive"
            value={youReceiveCents != null ? `${formatUsdCents(youReceiveCents)}/mo` : '—'}
          >
            {quote ? `${formatUsdCents(quote.monthlyAmountCents)} less the platform fee` : ''}
          </Stat>
          <Stat
            label="This month"
            value={
              runningMonth ? 'Paid' : billing.unpaid ? 'Unpaid' : disputedMonth ? 'On hold' : '—'
            }
          >
            {runningMonth
              ? `${runningMonth.label} · released 3 days after it ends`
              : disputedMonth
                ? `${disputedMonth.label} · with Gotham support`
                : billing.unpaid
                  ? 'Waiting for the client to pay'
                  : 'No month running'}
          </Stat>
          <Stat
            label="Next charge"
            value={billing.nextChargeDate ? formatDateOnly(billing.nextChargeDate) : 'None'}
          >
            {billing.nextChargeDate
              ? 'To the client, on the anniversary date'
              : 'Nothing more is scheduled'}
          </Stat>
          <Stat
            label="Months paid"
            value={termMonths != null ? `${paidMonths} of ${termMonths}` : String(paidMonths)}
          >
            {termMonths != null ? `${termMonths}-month agreement` : 'Month to month until ended'}
          </Stat>
        </div>
      )}
      {!hasBilling && hire.agreement != null && hire.status !== 'CANCELED' && (
        <Banner
          tone="muted"
          icon={<Receipt className="size-4 text-muted-foreground" aria-hidden />}
        >
          This agreement is paid outside the app; nothing is charged or released here.
        </Banner>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {children ? <p className="mt-1 text-xs text-muted-foreground">{children}</p> : null}
    </div>
  )
}
