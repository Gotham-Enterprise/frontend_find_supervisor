'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  AlertCircle,
  ChevronDown,
  CreditCard,
  Download,
  ExternalLink,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { exportSuperviseePayments, getSuperviseeReceiptUrl } from '@/lib/api/supervision'
import { IN_APP_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import {
  useCreateSuperviseeCardSetupIntent,
  useRefreshSuperviseeCards,
  useRemoveSuperviseeCard,
  useSuperviseeCards,
  useSuperviseePayments,
  useUserSnackbar,
} from '@/lib/hooks'
import { stripePromise } from '@/lib/stripe/client'
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
import type { SuperviseePaymentWeek, SuperviseeSavedCard } from '@/types/payouts'

import { SuperviseeWeekCard } from './SuperviseeWeekCard'

const PAGE_SIZE = 10

function cardLabel(card: SuperviseeSavedCard): string {
  const brand = card.brand ? card.brand[0].toUpperCase() + card.brand.slice(1) : 'Card'
  return `${brand} •••• ${card.last4 ?? '????'}`
}

function cardExpiry(card: SuperviseeSavedCard): string | null {
  return card.expMonth && card.expYear
    ? `Expires ${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
    : null
}

// ─── Add card dialog ──────────────────────────────────────────────────────────

function AddCardFields({ onSaved }: { onSaved: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!stripe || !elements) return
    setIsConfirming(true)
    setError(null)
    const result = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    setIsConfirming(false)
    if (result.error) {
      setError(result.error.message ?? 'We could not save this card. Please try another.')
      return
    }
    onSaved()
  }

  return (
    <div className="space-y-3">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { link: 'never' },
          defaultValues: { billingDetails: { address: { country: 'US' } } },
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs leading-relaxed text-muted-foreground">
        Nothing is charged when you save a card. You choose which saved card pays for each
        supervision agreement when you sign it.
      </p>
      <Button className="w-full" disabled={!stripe || isConfirming} onClick={handleSubmit}>
        {isConfirming ? 'Saving…' : 'Save card'}
      </Button>
    </div>
  )
}

function AddCardDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const { mutateAsync: createSetupIntent } = useCreateSuperviseeCardSetupIntent()
  const { showError } = useUserSnackbar()
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // Fresh SetupIntent each time the dialog opens; a used one can't be confirmed again.
  useEffect(() => {
    if (!open) {
      setClientSecret(null)
      return
    }
    let cancelled = false
    createSetupIntent()
      .then(({ clientSecret: secret }) => {
        if (!cancelled) setClientSecret(secret)
      })
      .catch((err) => {
        showError(parseApiError(err))
        onOpenChange(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per open
  }, [open])

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,1000px)] max-w-2xl">
        <DialogTitle>Add a card</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Saved to your account for your weekly supervision payments.
        </p>
        {!clientSecret || !stripePromise ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'flat',
                variables: { colorPrimary: '#006d36', borderRadius: '10px', fontSizeBase: '14px' },
              },
            }}
          >
            <AddCardFields onSaved={onSaved} />
          </Elements>
        )}
      </DialogContent>
    </DialogRoot>
  )
}

// ─── Saved cards ──────────────────────────────────────────────────────────────

function SavedCardsCard() {
  const { data, isLoading, isError, refetch } = useSuperviseeCards()
  const refreshCards = useRefreshSuperviseeCards()
  const removeMutation = useRemoveSuperviseeCard()
  const { showSuccess, showError } = useUserSnackbar()
  const [addOpen, setAddOpen] = useState(false)
  const [removing, setRemoving] = useState<SuperviseeSavedCard | null>(null)

  function handleSaved() {
    setAddOpen(false)
    void refreshCards()
    showSuccess('Card saved.', {
      description: 'You can pick it when you sign your next agreement.',
    })
  }

  function handleRemove() {
    if (!removing) return
    removeMutation.mutate(removing.id, {
      onSuccess: () => {
        showSuccess('Card removed.')
        setRemoving(null)
      },
      onError: (err) => {
        showError(parseApiError(err))
        setRemoving(null)
      },
    })
  }

  const cards = data?.cards ?? []

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Saved cards</CardTitle>
              <CardDescription className="mt-0.5">
                Cards for your weekly supervision payments. One card can pay for several
                supervisors.
              </CardDescription>
            </div>
          </div>
          <Button size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" aria-hidden />
            Add card
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your cards.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 size-4" />
              Retry
            </Button>
          </div>
        ) : cards.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No saved cards yet. You&apos;ll be asked for one when you sign an hourly supervision
            agreement, or add one now.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {cards.map((card) => {
              const inUse = card.inUseBy.length > 0
              const expiry = cardExpiry(card)
              return (
                <li key={card.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{cardLabel(card)}</p>
                    <p className="text-xs text-muted-foreground">
                      {expiry}
                      {inUse && (
                        <>
                          {expiry ? ' · ' : ''}
                          Pays for{' '}
                          {card.inUseBy
                            .map((hire) => hire.supervisorName ?? 'a supervisor')
                            .join(', ')}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {inUse && (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"
                      >
                        In use
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${cardLabel(card)}`}
                      disabled={inUse || removeMutation.isPending}
                      title={
                        inUse
                          ? 'Change the card on that supervision first, then remove this one.'
                          : undefined
                      }
                      onClick={() => setRemoving(card)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Cards are stored securely by Stripe. Your full card number is never stored by Find a
          Supervisor.
        </p>
      </CardContent>

      <AddCardDialog open={addOpen} onOpenChange={setAddOpen} onSaved={handleSaved} />

      <ConfirmDialog
        open={removing != null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove this card?"
        description={
          removing
            ? `${cardLabel(removing)} will be removed from your account. You can add it again later.`
            : ''
        }
        confirmLabel="Remove card"
        destructive
        isPending={removeMutation.isPending}
        onConfirm={handleRemove}
      />
    </Card>
  )
}

// ─── Payment history ──────────────────────────────────────────────────────────

/** Where the week stands for the payer, with the date that matters next. */
function weekState(week: SuperviseePaymentWeek): { text: string; className: string } {
  if (week.prepayStatus === 'FAILED') {
    return { text: "Payment didn't go through", className: 'text-destructive' }
  }
  if (week.status === 'SETTLED') {
    const when = week.settledAt ? ` ${formatEasternDate(week.settledAt)}` : ''
    return { text: `Settled${when}`, className: 'text-muted-foreground' }
  }
  if (week.status === 'DISPUTED')
    return { text: 'Disputed · with Gotham support', className: 'text-destructive' }
  if (week.status === 'IN_REVIEW')
    return {
      text: `Review by ${formatEasternDate(week.reviewEndsAt)}`,
      className: 'text-amber-700',
    }
  if (week.status === 'APPROVED')
    return { text: 'Approved · settling', className: 'text-muted-foreground' }
  return {
    text: `Paid · logging until ${formatEasternDate(week.logDeadlineAt)}`,
    className: 'text-muted-foreground',
  }
}

function approvedByText(week: SuperviseePaymentWeek): string {
  switch (week.approvedBy) {
    case 'SUPERVISEE':
      return 'by you'
    case 'SUPPORT':
      return 'by Gotham support'
    case 'AUTO':
      return 'automatically after the review'
    default:
      return ''
  }
}

/** Opens Stripe's receipt in a new tab once the link is fetched (tab opened in the click). */
function ReceiptButton({ weekId }: { weekId: string }) {
  const [loading, setLoading] = useState(false)
  const { showError } = useUserSnackbar()
  async function open() {
    const tab = window.open('', '_blank')
    setLoading(true)
    try {
      const url = await getSuperviseeReceiptUrl(weekId)
      if (tab) tab.location.href = url
      else window.location.assign(url)
    } catch (err) {
      tab?.close()
      showError(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button variant="outline" size="sm" disabled={loading} onClick={() => void open()}>
      <ExternalLink className="size-3.5" />
      {loading ? 'Opening…' : 'View receipt'}
    </Button>
  )
}

/** The week's money from the payer's side, its timeline, and what they can do about it. */
function WeekDetails({ week }: { week: SuperviseePaymentWeek }) {
  const prepaid = week.prepayStatus === 'PAID'
  const latePaid = week.lateEntries.filter((l) => l.chargeStatus === 'PAID')
  const lateCents = latePaid.reduce((sum, l) => sum + l.totalCents, 0)

  const timeline: { label: string; value: string }[] = []
  if (week.paidAt) timeline.push({ label: 'Charged', value: formatEasternDate(week.paidAt) })
  else if (week.prepayStatus === 'FAILED')
    timeline.push({
      label: 'Payment',
      value: `Didn't go through${week.failedAt ? ` ${formatEasternDate(week.failedAt)}` : ''}`,
    })
  timeline.push({ label: 'Logging deadline', value: formatEasternDateTime(week.logDeadlineAt) })
  if (week.disputedAt)
    timeline.push({ label: 'Disputed', value: formatEasternDate(week.disputedAt) })
  if (week.approvedAt) {
    timeline.push({
      label: 'Approved',
      value: `${formatEasternDate(week.approvedAt)} ${approvedByText(week)}`.trim(),
    })
  } else if (week.status !== 'SETTLED') {
    timeline.push({ label: 'Review ends', value: formatEasternDateTime(week.reviewEndsAt) })
  }
  if (week.settledAt) timeline.push({ label: 'Settled', value: formatEasternDate(week.settledAt) })

  return (
    <div className="grid gap-4 border-t bg-muted/20 px-4 py-3 sm:grid-cols-2">
      <div>
        <p className="text-xs font-medium text-foreground">
          {week.estimated ? 'Estimated cost' : 'Your cost'}
        </p>
        <dl className="mt-1.5 space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              Supervision ({formatDuration(week.billedMinutes)} ×{' '}
              {formatUsdCents(week.hourlyRateCents)}/h)
            </dt>
            <dd className="tabular-nums text-foreground">
              {formatUsdCents(week.hoursChargeCents)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Service fee</dt>
            <dd className="tabular-nums text-foreground">{formatUsdCents(week.serviceFeeCents)}</dd>
          </div>
          {lateCents > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Late sessions, charged separately</dt>
              <dd className="tabular-nums text-foreground">{formatUsdCents(lateCents)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t pt-1 font-medium">
            <dt className="text-foreground">Your cost</dt>
            <dd className="tabular-nums text-foreground">
              {week.estimated ? '≈ ' : ''}
              {formatUsdCents(week.costCents)}
            </dd>
          </div>
        </dl>
        {week.estimated && week.approvedMinutes == null && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Based on the hours logged so far; you approve them after the week.
          </p>
        )}
        {prepaid && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatUsdCents(week.totalCents)} was charged at the start of the week (
            {formatDuration(week.weeklyCapMinutes)} max + service fee).{' '}
            {week.status === 'SETTLED'
              ? week.refundCents
                ? `The unused ${formatUsdCents(week.refundCents)} went back to your card${week.settledAt ? ` on ${formatEasternDate(week.settledAt)}` : ''}.`
                : 'All of it was used.'
              : week.expectedRefundCents > 0
                ? `${week.estimated ? 'About ' : ''}${formatUsdCents(week.expectedRefundCents)} for unused hours goes back to your card after the review.`
                : null}
          </p>
        )}
        {latePaid.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {latePaid.map((l) => (
              <li key={l.id}>
                {formatCalendarDate(l.sessionDate)} · {formatDuration(l.durationMinutes)} ·{' '}
                {formatUsdCents(l.totalCents)}
                {l.paidAt ? ` · charged ${formatEasternDate(l.paidAt)}` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">Timeline</p>
        <dl className="mt-1.5 space-y-1 text-sm">
          {timeline.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          {week.hasReceipt && <ReceiptButton weekId={week.id} />}
          {week.canPayNow && (
            <Link href={week.sessionsPath} className={buttonVariants({ size: 'sm' })}>
              Pay now
            </Link>
          )}
          {week.canReview ? (
            <Link href={week.sessionsPath} className={buttonVariants({ size: 'sm' })}>
              Review sessions
            </Link>
          ) : (
            <Link
              href={week.sessionsPath}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              View sessions
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function PaymentHistoryCard() {
  const [page, setPage] = useState(1)
  const [openWeekId, setOpenWeekId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const { showError } = useUserSnackbar()
  const { data, isLoading, isError, refetch } = useSuperviseePayments(page)
  const totalPages = data ? Math.max(Math.ceil(data.totalCount / PAGE_SIZE), 1) : 1

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportSuperviseePayments()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `supervision-payments-${toEasternISODate()}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      showError(parseApiError(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription className="mt-0.5">
                Weekly payments across all your supervisors. You pay only for the hours you approve.
              </CardDescription>
            </div>
          </div>
          {data && data.totalCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={exporting}
              onClick={() => void handleExport()}
            >
              <Download className="size-3.5" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="size-4" aria-hidden />
              We couldn&apos;t load your payments.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* What they actually spent leads; what went back to the card is a footnote. */}
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-primary/5 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Total spent</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.netPaidCents)}
                </dd>
                <dd className="text-xs text-muted-foreground">approved hours + service fees</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Charged to your card</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.chargedCents)}
                </dd>
                {data.totals.refundedCents > 0 && (
                  <dd className="text-xs text-muted-foreground">
                    {formatUsdCents(data.totals.refundedCents)} back for unused hours
                  </dd>
                )}
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Charged this month</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.chargedThisMonthCents)}
                </dd>
                {data.totals.refundedThisMonthCents > 0 && (
                  <dd className="text-xs text-muted-foreground">
                    {formatUsdCents(data.totals.refundedThisMonthCents)} back for unused hours
                  </dd>
                )}
              </div>
            </dl>

            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payments yet. Weeks show up here once your first weekly payment goes through.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {data.items.map((week) => {
                  const state = weekState(week)
                  const open = openWeekId === week.id
                  return (
                    <li key={week.id}>
                      <button
                        type="button"
                        onClick={() => setOpenWeekId(open ? null : week.id)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {formatWeekRange(week.startDate, week.endDate)}
                            <span className="font-normal text-muted-foreground">
                              {' '}
                              · {week.supervisorName ?? 'Supervisor'}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(week.billedMinutes)}
                            {week.approvedMinutes != null ? ' approved' : ' logged'} ·{' '}
                            <span className={state.className}>{state.text}</span>
                          </p>
                          {week.failureMessage && (
                            <p className="text-xs text-destructive">{week.failureMessage}</p>
                          )}
                        </div>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-right">
                            {/* Leads with the week's cost; the full charge is secondary. */}
                            <span className="block text-sm font-semibold tabular-nums text-foreground">
                              {week.prepayStatus === 'FAILED' ? (
                                'Not charged'
                              ) : (
                                <>
                                  {week.estimated ? '≈ ' : ''}
                                  {formatUsdCents(week.costCents)}
                                </>
                              )}
                            </span>
                            {week.prepayStatus === 'PAID' && (
                              <span className="block text-xs tabular-nums text-muted-foreground">
                                {week.estimated ? 'your cost so far' : 'your cost'}
                              </span>
                            )}
                          </span>
                          <ChevronDown
                            className={`size-4 text-muted-foreground transition-transform ${
                              open ? 'rotate-180' : ''
                            }`}
                            aria-hidden
                          />
                        </span>
                      </button>
                      {open && <WeekDetails week={week} />}
                    </li>
                  )
                })}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SuperviseeBillingContent() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Billing</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Your saved cards and what you&apos;ve paid for supervision.
        </p>
      </div>

      {IN_APP_PAYMENTS_ENABLED ? (
        <div className="flex flex-col gap-6">
          <SuperviseeWeekCard />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="flex flex-col gap-6 lg:col-span-3">
              <PaymentHistoryCard />
            </div>
            <div className="flex flex-col gap-6 lg:col-span-2">
              <SavedCardsCard />
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          In-app payments aren&apos;t available yet. Supervision fees are arranged directly with
          your supervisor.
        </p>
      )}
    </div>
  )
}

export function SuperviseeBillingPanel() {
  return (
    <SuperviseeRouteGuard>
      <SuperviseeBillingContent />
    </SuperviseeRouteGuard>
  )
}
