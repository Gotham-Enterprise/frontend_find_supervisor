'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { AlertCircle, CheckCircle2, CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createHirePaymentSetupIntent } from '@/lib/api/supervision'
import {
  useHirePayment,
  useSaveHirePaymentMethod,
  useSetHireBackupCard,
  useUserSnackbar,
} from '@/lib/hooks'
import { stripePromise } from '@/lib/stripe/client'
import { parseApiError } from '@/lib/utils/error-parser'
import { MAX_CHARGE_ROUNDS } from '@/lib/utils/hourly-billing'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDateOnly } from '@/lib/utils/profile-formatters'
import type { HirePaymentInfo, SavedCard } from '@/types/payouts'

import { formatHours } from './HourlyQuoteSummary'

const NEW_CARD = 'new'

export function cardLabel(card: SavedCard): string {
  const brand = card.brand ? card.brand[0].toUpperCase() + card.brand.slice(1) : 'Card'
  const expiry =
    card.expMonth && card.expYear
      ? ` · exp ${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`
      : ''
  return `${brand} •••• ${card.last4 ?? '????'}${expiry}`
}

/**
 * One-glance weekly maximum, kept short so the card form below stays in view
 * (the full breakdown is in the agreement dialog).
 */
function WeeklyChargeSummary({ info }: { info: HirePaymentInfo }) {
  if (!info.quote) return null
  const { quote } = info
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground">Weekly total at the agreed max</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatUsdCents(quote.weeklyTotalCents)}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {formatHours(quote.weeklyCapMinutes)} at {formatUsdCents(quote.hourlyRateCents)}/hour (
        {formatUsdCents(quote.weeklyPrepayCents)}) + {formatUsdCents(quote.serviceFeeCents)} service
        fee. Your card is charged after each Friday&apos;s cutoff for the hours actually logged,
        plus a service fee on that amount; hours over the weekly max are flagged on your invoice and
        you can report a problem.
        {info.firstChargeDate && (
          <> First charge on {formatDateOnly(info.firstChargeDate)}, for that week&apos;s hours.</>
        )}
      </p>
    </div>
  )
}

/**
 * Supervisee payment step before signing an hourly agreement: pick a saved card
 * (e.g. from the platform subscription checkout) or add one. Nothing is
 * charged here — each week's hours are charged to this card after the Friday cutoff.
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
        <WeeklyChargeSummary info={info} />
        <div className="flex items-start justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Weekly payments are charged to{' '}
              <span className="font-medium">
                {info.card ? cardLabel(info.card) : 'your saved card'}
              </span>
              .
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setChangingCard(true)}>
            Change Card
          </Button>
        </div>
        <BackupCardSection hireId={hireId} info={info} />
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
          const replacing = info?.paymentStatus === 'card_saved'
          setChangingCard(false)
          onSaved?.()
          if (replacing) {
            // Failed weeks keep going through the 3 charge rounds; Pay now charges this card right away.
            showSuccess('Card updated', {
              description: `Weekly payments now use ${updated.card ? cardLabel(updated.card) : 'this card'}. If a week's payment didn't go through, tap Pay now on that week to pay it with this card right away.`,
            })
            return
          }
          // Prompt for the optional backup card without blocking the flow.
          showSuccess('Payment card saved!', {
            description: `${
              updated.firstChargeDate
                ? `Your first weekly payment is charged on ${formatDateOnly(updated.firstChargeDate)}, for the hours logged that week.`
                : `Your supervision with ${supervisorName} is ready to begin.`
            } You can add an optional backup card any time under Change card.`,
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  const authorization = `By saving this card, you authorize Find a Supervisor to charge it after each billing week under your agreement with ${supervisorName} for the hours your supervisor logged that week plus a service fee (${formatUsdCents(info.quote.weeklyTotalCents)} at the agreed weekly max of ${formatHours(info.quote.weeklyCapMinutes)}; hours over the max are flagged on your invoice and you can report a problem). If a problem report lowers the hours, the difference for those hours goes back to this card; the service fee isn't returned.`

  return (
    <div className="space-y-4">
      <WeeklyChargeSummary info={info} />

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
          ctaLabel="Save Card"
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
              {isSaving ? 'Saving…' : 'Save Card'}
            </Button>
          </div>
        </div>
      )}

      {/* The backup only makes sense once a primary card is saved. */}
      {info.card && <BackupCardSection hireId={hireId} info={info} />}
    </div>
  )
}

const BACKUP_COPY = `If your card declines when the week is charged, we try the backup right away, in each of the ${MAX_CHARGE_ROUNDS} rounds.`

/**
 * "Backup card (optional)": below the primary card, pick one of the other saved
 * cards or add a new one (same SetupIntent flow), with Remove backup. Prompted
 * for, never required — nothing is charged to it unless the primary card fails.
 */
function BackupCardSection({ hireId, info }: { hireId: string; info: HirePaymentInfo }) {
  const backupMutation = useSetHireBackupCard()
  const { showSuccess, showError } = useUserSnackbar()
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const backup = info.backupCard
  // The primary card can't double as its own backup.
  const candidates = info.savedCards.filter((card) => card.id !== info.card?.id)
  const choice = selected ?? candidates.find((c) => c.id !== backup?.id)?.id ?? NEW_CARD
  const isSaving = backupMutation.isPending

  function setBackup(paymentMethodId: string | null) {
    backupMutation.mutate(
      { hireId, paymentMethodId },
      {
        onSuccess: (updated) => {
          setEditing(false)
          setSelected(null)
          if (paymentMethodId == null) {
            showSuccess('Backup card removed', {
              description: 'Only your primary card is charged from now on.',
            })
            return
          }
          showSuccess('Backup card saved', {
            description: `${updated.backupCard ? cardLabel(updated.backupCard) : 'This card'} is tried right away if your primary card declines.`,
          })
        },
        onError: (err) => showError(parseApiError(err)),
      },
    )
  }

  const authorization = `By saving this backup card, you authorize Find a Supervisor to charge it only when your primary card declines for a billing week, for the same amount. ${BACKUP_COPY}`

  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2 text-sm text-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">Backup card (optional)</p>
            {backup ? (
              <p className="text-muted-foreground">{cardLabel(backup)}</p>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">{BACKUP_COPY}</p>
            )}
          </div>
        </div>
        {!editing && (
          <div className="flex shrink-0 gap-2">
            {backup && (
              <Button variant="ghost" size="sm" disabled={isSaving} onClick={() => setBackup(null)}>
                {isSaving ? 'Removing…' : 'Remove backup'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setEditing(true)}
            >
              {backup ? 'Change' : 'Add backup card'}
            </Button>
          </div>
        )}
      </div>
      {backup && !editing && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{BACKUP_COPY}</p>
      )}

      {editing && (
        <div className="mt-3 space-y-3">
          {candidates.length > 0 && (
            <div role="radiogroup" aria-label="Backup card" className="space-y-2">
              {candidates.map((card) => (
                <PaymentChoice
                  key={card.id}
                  checked={choice === card.id}
                  disabled={isSaving}
                  onSelect={() => setSelected(card.id)}
                >
                  <CreditCard className="size-4 text-muted-foreground" aria-hidden />
                  {cardLabel(card)}
                  {card.id === backup?.id && (
                    <span className="ml-1 text-xs opacity-80">(current backup)</span>
                  )}
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
            <>
              <NewCardForm
                hireId={hireId}
                ctaLabel="Save Backup Card"
                authorization={authorization}
                isSaving={isSaving}
                onCardSaved={setBackup}
              />
              <Button
                variant="outline"
                className="w-full"
                disabled={isSaving}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground">{authorization}</p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={isSaving} onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={isSaving || choice === backup?.id}
                  onClick={() => setBackup(choice)}
                >
                  <Lock className="size-3.5" />
                  {isSaving ? 'Saving…' : 'Save Backup Card'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PaymentChoice({
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
        checked
          ? 'border-primary bg-primary font-medium text-primary-foreground [&_svg]:text-primary-foreground'
          : 'border-border hover:bg-muted'
      }`}
    >
      {children}
      {checked && <CheckCircle2 className="ml-auto size-4 shrink-0" aria-hidden />}
    </button>
  )
}

/** Collects a new card with a SetupIntent, then hands its payment method to `onCardSaved`. */
export function NewCardForm({
  hireId,
  ctaLabel,
  authorization,
  isSaving,
  onCardSaved,
  createSetupIntent = createHirePaymentSetupIntent,
}: {
  hireId: string
  ctaLabel: string
  authorization: string
  isSaving: boolean
  onCardSaved: (paymentMethodId: string) => void
  /** Which hire billing the card is for; the hourly weekly charges by default. */
  createSetupIntent?: (hireId: string) => Promise<{ clientSecret: string }>
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requested = useRef(false)

  useEffect(() => {
    if (requested.current) return
    requested.current = true
    createSetupIntent(hireId)
      .then(({ clientSecret: secret }) => setClientSecret(secret))
      .catch((err) => setError(parseApiError(err)))
  }, [hireId, createSetupIntent])

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
