'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { AlertCircle, CheckCircle2, CreditCard, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createHirePaymentSetupIntent } from '@/lib/api/supervision'
import { useHirePayment, useStartHirePayment, useUserSnackbar } from '@/lib/hooks'
import { stripePromise } from '@/lib/stripe/client'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDate } from '@/lib/utils/profile-formatters'
import type { HirePaymentInfo, SavedCard } from '@/types/payouts'

import { WeeklyQuoteSummary } from './WeeklyQuoteSummary'

const NEW_CARD = 'new'

function cardLabel(card: SavedCard): string {
  const brand = card.brand ? card.brand[0].toUpperCase() + card.brand.slice(1) : 'Card'
  const expiry =
    card.expMonth && card.expYear
      ? ` · exp ${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
      : ''
  return `${brand} •••• ${card.last4 ?? '????'}${expiry}`
}

/** "You'll be charged $96.07 today…" / "Your first charge … on Oct 19…" */
function scheduleSentence(info: HirePaymentInfo): string | null {
  if (!info.quote || !info.schedule) return null
  const amount = formatUsdCents(info.quote.totalCents)
  const weeks = info.schedule.durationWeeks
  const until = formatDate(info.schedule.endsAt)
  return info.schedule.trialEndsAt
    ? `Your first charge of ${amount} will be on ${formatDate(info.schedule.trialEndsAt)}, then every week for ${weeks} week${weeks === 1 ? '' : 's'} (until ${until}).`
    : `You'll be charged ${amount} today, then every week for ${weeks} week${weeks === 1 ? '' : 's'} (until ${until}).`
}

/**
 * Supervisee payment step after signing a weekly agreement: pick a saved card
 * (e.g. from the platform subscription checkout) or add one, then start the
 * weekly charges.
 */
export function HirePaymentSetup({
  hireId,
  supervisorName,
}: {
  hireId: string
  supervisorName: string
}) {
  const { data: info, isLoading, isError, refetch } = useHirePayment(hireId, true)
  const startMutation = useStartHirePayment()
  const { showSuccess, showError } = useUserSnackbar()
  const [selected, setSelected] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isError || !info) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
        <p className="text-sm text-muted-foreground">We couldn&apos;t load your payment details.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (info.paymentStatus === 'scheduled' || info.paymentStatus === 'active') {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>
          Weekly payments are set up.{' '}
          {info.nextChargeAt && (
            <>
              {info.paymentStatus === 'scheduled' ? 'Your first charge is on ' : 'Next charge: '}
              <span className="font-medium">{formatDate(info.nextChargeAt)}</span>.
            </>
          )}
        </span>
      </div>
    )
  }

  if (info.paymentStatus !== 'awaiting_payment' || !info.quote) {
    return null
  }

  if (!info.supervisorPayoutsReady) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        {supervisorName} can&apos;t receive payments yet. You&apos;ll be able to set up payment once
        they finish their payout setup.
      </div>
    )
  }

  const choice = selected ?? info.savedCards[0]?.id ?? NEW_CARD
  const isStarting = startMutation.isPending

  function start(paymentMethodId: string) {
    startMutation.mutate(
      { hireId, paymentMethodId },
      {
        onSuccess: (updated) => {
          showSuccess('Weekly payments set up!', {
            description:
              updated.paymentStatus === 'scheduled' && updated.nextChargeAt
                ? `Your first charge is on ${formatDate(updated.nextChargeAt)}.`
                : `Your first week with ${supervisorName} is paid.`,
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  const authorization = `By confirming, you authorize Find a Supervisor to charge your card ${formatUsdCents(info.quote.totalCents)} every week for ${info.schedule?.durationWeeks ?? ''} weeks under your agreement with ${supervisorName}.`

  return (
    <div className="space-y-4">
      <WeeklyQuoteSummary
        quote={info.quote}
        perspective="supervisee"
        durationWeeks={info.schedule?.durationWeeks}
      />
      <p className="text-sm text-foreground">{scheduleSentence(info)}</p>

      <div role="radiogroup" aria-label="Payment method" className="space-y-2">
        {info.savedCards.map((card) => (
          <PaymentChoice
            key={card.id}
            checked={choice === card.id}
            disabled={isStarting}
            onSelect={() => setSelected(card.id)}
          >
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
            {cardLabel(card)}
          </PaymentChoice>
        ))}
        <PaymentChoice
          checked={choice === NEW_CARD}
          disabled={isStarting}
          onSelect={() => setSelected(NEW_CARD)}
        >
          <CreditCard className="size-4 text-muted-foreground" aria-hidden />
          Use a new card
        </PaymentChoice>
      </div>

      {choice === NEW_CARD ? (
        <NewCardForm
          hireId={hireId}
          ctaLabel={confirmLabel(info)}
          authorization={authorization}
          isStarting={isStarting}
          onCardSaved={start}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{authorization}</p>
          <Button className="w-full" disabled={isStarting} onClick={() => start(choice)}>
            <Lock className="size-3.5" />
            {isStarting ? 'Setting up…' : confirmLabel(info)}
          </Button>
        </div>
      )}
    </div>
  )
}

function confirmLabel(info: HirePaymentInfo): string {
  return info.schedule?.trialEndsAt
    ? 'Confirm weekly payments'
    : `Pay ${formatUsdCents(info.quote?.totalCents ?? 0)} & start weekly payments`
}

function PaymentChoice({
  checked,
  disabled,
  onSelect,
  children,
}: {
  checked: boolean
  disabled: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

/** Collects a new card with a SetupIntent, then hands its payment method to `onCardSaved`. */
function NewCardForm({
  hireId,
  ctaLabel,
  authorization,
  isStarting,
  onCardSaved,
}: {
  hireId: string
  ctaLabel: string
  authorization: string
  isStarting: boolean
  onCardSaved: (paymentMethodId: string) => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    createHirePaymentSetupIntent(hireId)
      .then(({ clientSecret: secret }) => setClientSecret(secret))
      .catch((err) => setError(parseApiError(err)))
  }, [hireId])

  if (!stripePromise) {
    return <p className="text-sm text-destructive">Card payments are not configured.</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }
  if (!clientSecret) {
    return <Skeleton className="h-40 w-full" />
  }

  return (
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
      <NewCardFields
        ctaLabel={ctaLabel}
        authorization={authorization}
        isStarting={isStarting}
        onCardSaved={onCardSaved}
      />
    </Elements>
  )
}

function NewCardFields({
  ctaLabel,
  authorization,
  isStarting,
  onCardSaved,
}: {
  ctaLabel: string
  authorization: string
  isStarting: boolean
  onCardSaved: (paymentMethodId: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!stripe || !elements) return
    setIsSaving(true)
    setError(null)
    const result = await stripe.confirmSetup({
      elements,
      // Cards needing a bank redirect come back to this page; most finish inline.
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    setIsSaving(false)
    if (result.error) {
      setError(result.error.message ?? 'We could not save this card. Please try another.')
      return
    }
    const pm = result.setupIntent?.payment_method
    const paymentMethodId = typeof pm === 'string' ? pm : pm?.id
    if (paymentMethodId) onCardSaved(paymentMethodId)
  }

  const busy = isSaving || isStarting
  return (
    <div className="space-y-3">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs leading-relaxed text-muted-foreground">{authorization}</p>
      <Button
        className="w-full"
        disabled={busy || !stripe || !elements}
        onClick={() => void handleSubmit()}
      >
        <Lock className="size-3.5" />
        {busy ? 'Setting up…' : ctaLabel}
      </Button>
    </div>
  )
}
