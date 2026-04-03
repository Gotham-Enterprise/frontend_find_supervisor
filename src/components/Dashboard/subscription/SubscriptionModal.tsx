'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { FREE_PLAN_ID, mergeFreeWithApiPlans } from '@/lib/constants/subscription-plans'
import {
  useCurrentSubscriptionQuery,
  useSubscriptionPlansQuery,
} from '@/lib/hooks/useSubscriptionPlans'
import { cn } from '@/lib/utils'
import {
  formatBillingCycleLabel,
  formatBillingCycleSuffix,
  formatPlanPriceFromCents,
} from '@/lib/utils/plan-formatting'
import {
  planMatchesSubscription,
  resolveCurrentChoosablePlan,
} from '@/lib/utils/subscription-plan-resolution'
import type { ChoosablePlan } from '@/types/supervisor-profile'

const FREE_FEATURES = [
  'Browse supervisor profiles',
  'View session availability',
  'Track goals & progress',
  'Access session history (limited)',
]

const PAID_FALLBACK_FEATURES = [
  'Everything in Free',
  'Browse verified supervisors',
  'Direct messaging with supervisors',
  'Availability & scheduling tools',
  'Priority supervisor matching',
]

interface SubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function isPaidPlan(plan: ChoosablePlan): plan is ChoosablePlan & { isFree?: false } {
  return plan.id !== FREE_PLAN_ID
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const router = useRouter()

  const {
    data: plansData,
    isPending: plansPending,
    isError: plansError,
    error: plansErrorObj,
    refetch: refetchPlans,
  } = useSubscriptionPlansQuery(open)

  const {
    data: currentSubscription,
    isPending: currentPending,
    isError: currentError,
    error: currentErrorObj,
    refetch: refetchCurrent,
  } = useCurrentSubscriptionQuery(open)

  const mergedPlans = useMemo(() => mergeFreeWithApiPlans(plansData ?? []), [plansData])

  const resolution = useMemo(
    () => resolveCurrentChoosablePlan(currentSubscription ?? null, mergedPlans),
    [currentSubscription, mergedPlans],
  )

  const paidPlans = useMemo(() => mergedPlans.filter((p) => isPaidPlan(p)), [mergedPlans])

  const awaitingSubscriptionStatus = open && currentPending && !!plansData

  function goToCheckout(planId: string) {
    onOpenChange(false)
    router.push(`/checkout?planId=${encodeURIComponent(planId)}`)
  }

  function paidFeaturesFor(plan: ChoosablePlan) {
    if (!isPaidPlan(plan)) return FREE_FEATURES
    const desc = plan.description?.trim()
    if (desc) {
      const lines = desc
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
      if (lines.length > 1) return lines
      return [desc]
    }
    return PAID_FALLBACK_FEATURES
  }

  const gridClass =
    mergedPlans.length <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-10" aria-describedby={undefined}>
        <div className="mb-7 text-center">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Choose your plan
          </DialogTitle>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Unlock the full platform experience. Cancel anytime.
          </p>
          {awaitingSubscriptionStatus && (
            <p className="mt-2 text-xs text-muted-foreground">Checking your subscription…</p>
          )}
        </div>

        {plansError && (
          <div
            className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex-1 text-left">
              <p className="font-semibold">Couldn&apos;t load paid plans</p>
              <p className="mt-1 text-muted-foreground">
                {plansErrorObj instanceof Error ? plansErrorObj.message : 'Please try again.'}
              </p>
              <button
                type="button"
                onClick={() => refetchPlans()}
                className="mt-2 text-sm font-semibold text-primary underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {currentError && (
          <div
            className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-foreground"
            role="status"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <div className="flex-1 text-left">
              <p className="font-semibold">Couldn&apos;t load subscription status</p>
              <p className="mt-1 text-muted-foreground">
                {currentErrorObj instanceof Error
                  ? currentErrorObj.message
                  : 'You can still compare plans below.'}
              </p>
              <button
                type="button"
                onClick={() => refetchCurrent()}
                className="mt-2 text-sm font-semibold text-primary underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className={cn('grid gap-5', gridClass)}>
          {mergedPlans.map((plan) => {
            const isFree = plan.id === FREE_PLAN_ID
            const isFirstPaid = isPaidPlan(plan) && paidPlans[0]?.id === plan.id
            const isThisCurrent = planMatchesSubscription(plan, resolution)
            const showCurrentBadge = isThisCurrent && resolution.isActivePaid
            const showPendingBadge = isThisCurrent && resolution.isPendingActivation
            const titleNeedsRightPad = isFirstPaid
            const titleNeedsLeftPad = showCurrentBadge || showPendingBadge

            const showDisabledCurrentCta =
              (isPaidPlan(plan) && isThisCurrent && resolution.isActivePaid) ||
              (isFree && isThisCurrent)

            return (
              <div
                key={plan.id}
                role="group"
                aria-label={plan.name}
                className={cn(
                  'relative flex flex-col rounded-xl border p-6 text-left transition-all',
                  showDisabledCurrentCta
                    ? 'border-border bg-muted/40 ring-1 ring-border/60'
                    : 'border-border hover:border-primary/40',
                  !isFree && !showDisabledCurrentCta && 'bg-primary/5',
                )}
              >
                {showCurrentBadge && (
                  <div className="absolute left-3 top-3 z-10 inline-flex h-6 items-center justify-center rounded-md border border-emerald-600/25 bg-emerald-50 px-2.5 dark:bg-emerald-950/40">
                    <span className="text-[9px] font-semibold uppercase leading-none tracking-wider text-emerald-800 dark:text-emerald-200">
                      Current plan
                    </span>
                  </div>
                )}
                {showPendingBadge && (
                  <div className="absolute left-3 top-3 z-10 inline-flex h-6 items-center justify-center rounded-md border border-amber-500/30 bg-amber-50 px-2.5 dark:bg-amber-950/40">
                    <span className="text-[9px] font-semibold uppercase leading-none tracking-wider text-amber-900 dark:text-amber-100">
                      Pending payment
                    </span>
                  </div>
                )}

                {isFirstPaid && (
                  <div className="absolute right-3 top-3 z-10 inline-flex h-6 items-center justify-center rounded-md bg-primary px-2.5 shadow-sm">
                    <span className="block text-center text-[9px] font-semibold uppercase leading-none tracking-wider text-primary-foreground">
                      Most popular
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    'mb-5',
                    titleNeedsRightPad && 'pr-24',
                    titleNeedsLeftPad && 'pl-24',
                    (titleNeedsRightPad || titleNeedsLeftPad) && 'pt-0.5',
                  )}
                >
                  <p
                    className={cn(
                      'text-base font-bold leading-snug',
                      isFree ? 'text-foreground' : 'text-primary',
                    )}
                  >
                    {plan.name}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1">
                    {formatPlanPriceFromCents(plan.priceInCents) === 'Free' ? (
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        $0
                      </span>
                    ) : (
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        {formatPlanPriceFromCents(plan.priceInCents)}
                      </span>
                    )}
                    {formatBillingCycleSuffix(plan.billingCycle) ? (
                      <span className="text-sm text-muted-foreground">
                        {formatBillingCycleSuffix(plan.billingCycle)}
                      </span>
                    ) : isFree ? (
                      <span className="text-sm text-muted-foreground">/mo.</span>
                    ) : null}
                  </div>
                  {isPaidPlan(plan) && plan.billingCycle && (
                    <p className="mt-1 text-xs text-primary">
                      {formatBillingCycleLabel(plan.billingCycle)}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {plan.description ??
                      (isFree
                        ? 'Basic access to browse supervisors and explore the platform.'
                        : 'Full access to messaging, scheduling tools, and priority support.')}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {paidFeaturesFor(plan).map((feature) => (
                    <li key={`${plan.id}-${feature}`} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          isFree ? 'text-muted-foreground' : 'text-primary',
                        )}
                      />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {showDisabledCurrentCta ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-border bg-muted/60 py-3 text-sm font-semibold text-muted-foreground"
                  >
                    Your current plan
                  </button>
                ) : isPaidPlan(plan) ? (
                  <button
                    type="button"
                    onClick={() => goToCheckout(plan.id)}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Choose plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Choose plan
                  </button>
                )}
              </div>
            )
          })}

          {plansPending && !plansData && (
            <div
              className="flex flex-col rounded-xl border border-dashed border-border p-6 animate-pulse"
              aria-hidden
            >
              <div className="mb-3 h-4 w-24 rounded bg-muted" />
              <div className="mb-2 h-10 w-36 rounded bg-muted" />
              <div className="mb-6 h-3 w-full rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-11/12 rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Have questions?{' '}
          <span className="cursor-pointer font-semibold text-primary underline underline-offset-2">
            Contact support
          </span>
        </p>
      </DialogContent>
    </DialogRoot>
  )
}
