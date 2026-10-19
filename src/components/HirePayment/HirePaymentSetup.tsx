'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { AlertCircle, CheckCircle2, CreditCard, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createHirePaymentSetupIntent } from '@/lib/api/supervision'
import { useHirePayment, useSaveHirePaymentMethod, useUserSnackbar } from '@/lib/hooks'
import { stripePromise } from '@/lib/stripe/client'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDateOnly } from '@/lib/utils/profile-formatters'
import type { HirePaymentInfo, SavedCard } from '@/types/payouts'

import { formatHours } from './HourlyQuoteSummary'

const NEW_CARD = 'new'

function cardLabel(card: SavedCard): string {
  const brand = card.brand ? card.brand[0].toUpperCase() + card.brand.slice(1) : 'Card'
  const expiry =
    card.expMonth && card.expYear
      ? ` · exp ${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
      : ''
  return `${brand} •••• ${card.last4 ?? '????'}${expiry}`
}

/**
 * One-glance weekly charge, kept short so the card form below stays in view
 * (the full breakdown is in the agreement dialog).
 */
function PrepaySummary({ info }: { info: HirePaymentInfo }) {
  if (!info.quote) return null
  const { quote } = info
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground">
          Charged at the start of each week
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatUsdCents(quote.weeklyTotalCents)}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Up to {formatHours(quote.weeklyCapMinutes)} at {formatUsdCents(quote.hourlyRateCents)}/hour
        ({formatUsdCents(quote.weeklyPrepayCents)}) + {formatUsdCents(quote.serviceFeeCents)}{' '}
        service fee.
        {info.firstPrepayDate && <> First charge on {formatDateOnly(info.firstPrepayDate)}.</>}{' '}
        Hours you don&apos;t use are refunded after your weekly review.
      </p>
    </div>
  )
}

/**
 * Supervisee payment step after signing an hourly agreement: pick a saved card
 * (e.g. from the platform subscription checkout) or add one. Nothing is
 * charged here — the weekly prepays are charged to this card from the start date.
 */
export function HirePaymentSetup({
  hireId,
  supervisorName,
  startChangingCard = false,
  onSaved,
}: {
  hireId: string
  supervisorName: string
  /** Open straight on the card picker even when a card is already saved. */
  startChangingCard?: boolean
  onSaved?: () => void
}) {
  const { data: info, isLoading, isError, refetch } = useHirePayment(hireId, true)
  const saveMutation = useSaveHirePaymentMethod()
  const { showSuccess, showError } = useUserSnackbar()
  const [selected, setSelected] = useState<string | null>(null)
  const [changingCard, setChangingCard] = useState(startChangingCard)

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

  if (
    !info.quote ||
    (info.paymentStatus !== 'awaiting_card' && info.paymentStatus !== 'card_saved')
  ) {
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

  if (info.paymentStatus === 'card_saved' && !changingCard) {
    return (
      <div className="space-y-3">
        <PrepaySummary info={info} />
        <div className="flex items-start justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Weekly prepays are charged to{' '}
              <span className="font-medium">
                {info.card ? cardLabel(info.card) : 'your saved card'}
              </span>
              .
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setChangingCard(true)}>
            Change card
          </Button>
        </div>
      </div>
    )
  }

  const choice = selected ?? info.card?.id ?? info.savedCards[0]?.id ?? NEW_CARD
  const isSaving = saveMutation.isPending

  function save(paymentMethodId: string) {
    saveMutation.mutate(
      { hireId, paymentMethodId },
      {
        onSuccess: (updated) => {
          setChangingCard(false)
          onSaved?.()
          showSuccess('Payment card saved!', {
            description: updated.firstPrepayDate
              ? `Your first weekly prepay is charged on ${formatDateOnly(updated.firstPrepayDate)}.`
              : `Your supervision with ${supervisorName} is ready to begin.`,
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  const authorization = `By saving this card, you authorize Find a Supervisor to charge it ${formatUsdCents(info.quote.weeklyTotalCents)} at the start of each billing week under your agreement with ${supervisorName}. After you review each week's sessions, the unused part of the prepay is refunded to this card.`

  return (
    <div className="space-y-4">
      <PrepaySummary info={info} />

      {/* With no saved cards there is nothing to choose: show the card form directly. */}
      {info.savedCards.length > 0 && (
        <div role="radiogroup" aria-label="Payment method" className="space-y-2">
          {info.savedCards.map((card) => (
            <PaymentChoice
              key={card.id}
              checked={choice === card.id}
              disabled={isSaving}
              onSelect={() => setSelected(card.id)}
            >
              <CreditCard className="size-4 text-muted-foreground" aria-hidden />
              {cardLabel(card)}
            </PaymentChoice>
          ))}
          <PaymentChoice
            checked={choice === NEW_CARD}
            disabled={isSaving}
            onSelect={() => setSelected(NEW_CARD)}
          >
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
            Use a new card
          </PaymentChoice>
        </div>
      )}

      {choice === NEW_CARD ? (
        <NewCardForm
          hireId={hireId}
          ctaLabel="Save card"
          authorization={authorization}
          isSaving={isSaving}
          onCardSaved={save}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{authorization}</p>
          <div className="flex gap-2">
            {changingCard && (
              <Button variant="outline" disabled={isSaving} onClick={() => setChangingCard(false)}>
                Cancel
              </Button>
            )}
            <Button className="flex-1" disabled={isSaving} onClick={() => save(choice)}>
              <Lock className="size-3.5" />
              {isSaving ? 'Saving…' : 'Save card'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
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
  isSaving,
  onCardSaved,
}: {
  hireId: string
  ctaLabel: string
  authorization: string
  isSaving: boolean
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
        isSaving={isSaving}
        onCardSaved={onCardSaved}
      />
    </Elements>
  )
}

function NewCardFields({
  ctaLabel,
  authorization,
  isSaving,
  onCardSaved,
}: {
  ctaLabel: string
  authorization: string
  isSaving: boolean
  onCardSaved: (paymentMethodId: string) => void
}) {
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
      // Cards needing a bank redirect come back to this page; most finish inline.
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    setIsConfirming(false)
    if (result.error) {
      setError(result.error.message ?? 'We could not save this card. Please try another.')
      return
    }
    const pm = result.setupIntent?.payment_method
    const paymentMethodId = typeof pm === 'string' ? pm : pm?.id
    if (paymentMethodId) onCardSaved(paymentMethodId)
  }

  const busy = isConfirming || isSaving
  return (
    <div className="space-y-3">
      <PaymentElement
        options={{
          layout: 'tabs',
          // Card only, saved once per hire: Link's "save my information" signup
          // (email + mobile number, with a geo-guessed country code) just adds
          // noise. Supervision is US-based, so default the billing country too.
          wallets: { link: 'never' },
          defaultValues: { billingDetails: { address: { country: 'US' } } },
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs leading-relaxed text-muted-foreground">{authorization}</p>
      <Button
        className="w-full"
        disabled={busy || !stripe || !elements}
        onClick={() => void handleSubmit()}
      >
        <Lock className="size-3.5" />
        {busy ? 'Saving…' : ctaLabel}
      </Button>
    </div>
  )
}
