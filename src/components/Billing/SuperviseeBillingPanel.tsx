'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { AlertCircle, CreditCard, Plus, Receipt, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
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
import { formatDuration, formatEasternDate, formatWeekRange } from '@/lib/utils/date'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import type { SuperviseePaymentWeek, SuperviseeSavedCard } from '@/types/payouts'

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
      <DialogContent className="max-h-[min(92vh,1000px)] max-w-2xl overflow-y-auto">
        <DialogTitle>Add a card</DialogTitle>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Saved to your account for the weekly supervision prepays.
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
                Cards for your weekly supervision prepays. One card can pay for several supervisors.
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

function weekState(week: SuperviseePaymentWeek): { text: string; className: string } {
  if (week.prepayStatus === 'FAILED') {
    return { text: 'Payment failed', className: 'text-destructive' }
  }
  if (week.status === 'SETTLED') {
    return {
      text: week.refundCents ? `Settled · ${formatUsdCents(week.refundCents)} refunded` : 'Settled',
      className: 'text-muted-foreground',
    }
  }
  if (week.status === 'DISPUTED') return { text: 'Disputed', className: 'text-destructive' }
  if (week.status === 'IN_REVIEW')
    return { text: 'Awaiting your review', className: 'text-amber-700' }
  if (week.status === 'APPROVED')
    return { text: 'Approved · settling', className: 'text-muted-foreground' }
  return { text: 'Prepaid · in progress', className: 'text-muted-foreground' }
}

function PaymentHistoryCard() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useSuperviseePayments(page)
  const totalPages = data ? Math.max(Math.ceil(data.totalCount / PAGE_SIZE), 1) : 1

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle>Payment history</CardTitle>
            <CardDescription className="mt-0.5">
              Weekly prepays across all your supervisors. Unused hours are refunded after each
              week&apos;s review.
            </CardDescription>
          </div>
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
            <dl className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Charged</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.chargedCents)}
                </dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Refunded</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.refundedCents)}
                </dd>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <dt className="text-xs text-muted-foreground">Net paid</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatUsdCents(data.totals.netPaidCents)}
                </dd>
              </div>
            </dl>

            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No payments yet. Weeks show up here once your first prepay goes through.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {data.items.map((week) => {
                  const state = weekState(week)
                  return (
                    <li key={week.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {formatWeekRange(week.startDate, week.endDate)}
                          <span className="font-normal text-muted-foreground">
                            {' '}
                            · {week.supervisorName ?? 'Supervisor'}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {week.approvedMinutes != null
                            ? `${formatDuration(week.approvedMinutes)} approved · `
                            : ''}
                          <span className={state.className}>{state.text}</span>
                          {week.paidAt && week.prepayStatus === 'PAID'
                            ? ` · charged ${formatEasternDate(week.paidAt)}`
                            : ''}
                        </p>
                        {week.failureMessage && (
                          <p className="text-xs text-destructive">{week.failureMessage}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {formatUsdCents(week.chargedCents)}
                      </span>
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-3">
            <PaymentHistoryCard />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            <SavedCardsCard />
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
