'use client'

import { CheckCircle2, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useHireMonthlyBilling } from '@/lib/hooks/useMonthlyBilling'
import { formatDisplayName } from '@/lib/utils/profile-formatters'
import type { HireListItem } from '@/types/hire'

import { MonthlyQuoteSummary } from './MonthlyQuoteSummary'

/**
 * The agreement's monthly payment section (in-app monthly agreements): the
 * breakdown for either side and, for the supervisee, the card step that comes
 * before signing — the monthly counterpart of the hourly "Weekly Payment".
 */
export function MonthlyAgreementPayment({
  hire,
  viewerIsSupervisor,
  showSignForm,
  hasSavedCards,
  cardLabelText,
  onSetUpPayment,
  onLeave,
}: {
  hire: HireListItem
  viewerIsSupervisor: boolean
  showSignForm: boolean
  hasSavedCards: boolean
  cardLabelText: string | null
  onSetUpPayment?: (options?: { changeCard?: boolean }) => void
  onLeave?: () => void
}) {
  const agreement = hire.agreement
  const showsSupervisee =
    !viewerIsSupervisor &&
    onSetUpPayment != null &&
    (agreement?.superviseeSignedAt != null || showSignForm)
  const { data: billing, isLoading } = useHireMonthlyBilling(
    hire.id,
    viewerIsSupervisor || showsSupervisee,
  )
  if (!viewerIsSupervisor && !showsSupervisee) return null

  return (
    <>
      <Separator className="my-5" />
      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {showSignForm && !viewerIsSupervisor
            ? 'Step 1: Set up monthly payment'
            : 'Monthly Payment'}
        </h3>
        {isLoading || !billing ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <MonthlyQuoteSummary
            quote={billing.quote}
            perspective={viewerIsSupervisor ? 'supervisor' : 'supervisee'}
          />
        )}
        {showsSupervisee && onSetUpPayment && (
          <>
            {showSignForm && hire.paymentMethodSavedAt == null && (
              <p className="mt-2 text-xs text-muted-foreground">
                {hasSavedCards
                  ? `Choose which saved card pays for your monthly payments to ${formatDisplayName(hire.supervisor)}.`
                  : 'Save the card for your monthly payments first.'}{' '}
                Nothing is charged until the agreement is signed and the start date arrives.
              </p>
            )}
            {hire.paymentMethodSavedAt ? (
              <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CreditCard className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
                      Payment card saved
                    </p>
                    {cardLabelText && (
                      <p className="mt-0.5 truncate text-xs text-emerald-800">{cardLabelText}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-emerald-300 bg-white hover:bg-emerald-100"
                  onClick={() => {
                    onLeave?.()
                    onSetUpPayment({ changeCard: true })
                  }}
                >
                  Change Card
                </Button>
              </div>
            ) : (
              <Button
                className="mt-3 w-full"
                onClick={() => {
                  onLeave?.()
                  onSetUpPayment()
                }}
              >
                <CreditCard className="size-4" aria-hidden />
                {hasSavedCards ? 'Choose card' : 'Set up payment'}
              </Button>
            )}
          </>
        )}
      </section>
    </>
  )
}
