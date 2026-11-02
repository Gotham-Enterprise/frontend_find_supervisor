'use client'

import { AlertCircle, CheckCircle2, CreditCard, Lock } from 'lucide-react'
import { useState } from 'react'

import { cardLabel, NewCardForm, PaymentChoice } from '@/components/HirePayment/HirePaymentSetup'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { createMonthlySetupIntent } from '@/lib/api/monthly-billing'
import { useUserSnackbar } from '@/lib/hooks'
import { useHireMonthlyBilling, useSaveMonthlyCard } from '@/lib/hooks/useMonthlyBilling'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatUsdCents } from '@/lib/utils/money'
import { formatDateOnly, formatDisplayName } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

const NEW_CARD = 'new'

/**
 * The supervisee picks or adds the card for a monthly agreement's payments.
 * Saving charges nothing unless a month is already due (the start date passed).
 */
function MonthlyPaymentSetup({
  hireId,
  supervisorName,
  startChangingCard,
  onSaved,
}: {
  hireId: string
  supervisorName: string
  startChangingCard: boolean
  onSaved: () => void
}) {
  const { data: info, isLoading, isError, refetch } = useHireMonthlyBilling(hireId)
  const saveMutation = useSaveMonthlyCard(hireId)
  const { showSuccess, showError } = useUserSnackbar()
  const [selected, setSelected] = useState<string | null>(null)
  const [changingCard, setChangingCard] = useState(startChangingCard)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
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
  if (!info.supervisorPayoutsReady) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        {supervisorName} can&apos;t receive payments yet. You&apos;ll be able to set up payment once
        they finish their payout setup.
      </div>
    )
  }

  const total = formatUsdCents(info.quote.monthlyTotalCents)
  const summary = (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground">Charged each month</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{total}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {formatUsdCents(info.quote.monthlyAmountCents)} +{' '}
        {formatUsdCents(info.quote.serviceFeeCents)} service fee.{' '}
        {info.signed ? (
          info.nextChargeDate && <>Next charge on {formatDateOnly(info.nextChargeDate)}.</>
        ) : (
          <>First charge on {formatDateOnly(info.firstChargeDate)}, after you sign.</>
        )}
      </p>
    </div>
  )

  if (info.paymentStatus === 'card_saved' && !changingCard) {
    return (
      <div className="space-y-3">
        {summary}
        <div className="flex items-start justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Monthly payments are charged to{' '}
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
      </div>
    )
  }

  const choice = selected ?? info.card?.id ?? info.savedCards[0]?.id ?? NEW_CARD
  const isSaving = saveMutation.isPending

  function save(paymentMethodId: string) {
    const replacing = info?.paymentStatus === 'card_saved'
    saveMutation.mutate(paymentMethodId, {
      onSuccess: (updated) => {
        setChangingCard(false)
        onSaved()
        if (replacing) {
          showSuccess('Card updated', {
            description: `Monthly payments now use ${updated.card ? cardLabel(updated.card) : 'this card'}. If a month's payment didn't go through, tap Pay now on that month.`,
          })
          return
        }
        showSuccess('Payment card saved!', {
          description: updated.signed
            ? `Your supervision with ${supervisorName} is set up for monthly payments.`
            : `Now sign the agreement. Your first monthly payment is charged on ${formatDateOnly(updated.firstChargeDate)}.`,
        })
      },
      onError: (err) => showError(parseApiError(err)),
    })
  }

  const authorization = `By saving this card, you authorize Find a Supervisor to charge it ${total} on the start date and on the same day each month under your agreement with ${supervisorName}, until the agreement ends. If you end it, supervision continues until the end of the month you paid for, and that month isn't refunded.`

  return (
    <div className="space-y-4">
      {summary}
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
          createSetupIntent={createMonthlySetupIntent}
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
    </div>
  )
}

/** The supervisee's card step for a monthly agreement, in its own dialog. */
export function MonthlyPaymentDialog({
  hire,
  open,
  onOpenChange,
  changeCard = false,
  onSaved,
}: {
  hire: HireListItem
  open: boolean
  onOpenChange: (open: boolean) => void
  changeCard?: boolean
  /** Called after the card is saved and the dialog closes (e.g. to return to signing). */
  onSaved?: () => void
}) {
  const supervisorName = formatDisplayName(hire.supervisor)
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,1000px)] max-w-2xl"
        header={
          <>
            <DialogTitle>
              {changeCard ? 'Change payment card' : 'Set up monthly payment'}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Save the card for your monthly payments to {supervisorName}.
            </p>
          </>
        }
      >
        <MonthlyPaymentSetup
          hireId={hire.id}
          supervisorName={supervisorName}
          startChangingCard={changeCard}
          onSaved={() => {
            onOpenChange(false)
            onSaved?.()
          }}
        />
      </DialogContent>
    </DialogRoot>
  )
}
