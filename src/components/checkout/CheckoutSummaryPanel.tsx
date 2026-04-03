'use client'

import { CheckCircle2, Clock, Lock } from 'lucide-react'

import { useCheckoutPlanFromUrl } from '@/lib/hooks/useCheckoutPlanFromUrl'
import {
  formatBillingCycleLabel,
  formatBillingCycleSuffix,
  formatPlanPriceFromCents,
} from '@/lib/utils/plan-formatting'

const FALLBACK_FEATURES = [
  'View supervisor contact details',
  'Direct messaging with supervisors',
  'Enhanced communication tools',
  'Priority supervisor matching',
  'Session scheduling tools',
]

function PricingRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-sm font-semibold text-white' : 'text-sm text-white/55'}>
        {label}
      </span>
      <span className={bold ? 'text-sm font-bold text-white' : 'text-sm text-white/75'}>
        {value}
      </span>
    </div>
  )
}

function featuresFromPlan(description: string | null | undefined): string[] {
  const d = description?.trim()
  if (!d) return FALLBACK_FEATURES
  const lines = d
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.length > 0 ? lines : FALLBACK_FEATURES
}

export function CheckoutSummaryPanel() {
  const { planId, plan, isLoading } = useCheckoutPlanFromUrl()

  if (!planId) {
    return (
      <aside className="flex flex-col gap-8 bg-[#008542] px-8 py-12 lg:w-[420px] lg:shrink-0">
        <p className="text-sm text-white/80">
          No plan selected. Open the dashboard and choose a paid plan to continue checkout.
        </p>
      </aside>
    )
  }

  if (isLoading && !plan) {
    return (
      <aside className="flex flex-col gap-8 bg-[#008542] px-8 py-12 lg:w-[420px] lg:shrink-0">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-28 rounded bg-white/20" />
          <div className="h-12 w-40 rounded bg-white/20" />
          <div className="h-4 w-full rounded bg-white/10" />
        </div>
      </aside>
    )
  }

  if (!plan) {
    return (
      <aside className="flex flex-col gap-8 bg-[#008542] px-8 py-12 lg:w-[420px] lg:shrink-0">
        <p className="text-sm font-semibold text-white">We couldn&apos;t find that plan.</p>
        <p className="text-sm text-white/70">Return to the dashboard and pick a plan again.</p>
      </aside>
    )
  }

  const priceLabel = plan.priceInCents === 0 ? 'Free' : formatPlanPriceFromCents(plan.priceInCents)
  const suffix = formatBillingCycleSuffix(plan.billingCycle)
  const billingNote = formatBillingCycleLabel(plan.billingCycle)
  const featureList = featuresFromPlan(plan.description)
  const subtotal = plan.priceInCents === 0 ? '$0.00' : formatPlanPriceFromCents(plan.priceInCents)

  return (
    <aside className="flex flex-col gap-8 bg-[#008542] px-8 py-12 lg:w-[420px] lg:shrink-0">
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit shrink-0 items-center self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
          {plan.name}
        </span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold tracking-tight text-white">{priceLabel}</span>
            {suffix ? (
              <span className="text-lg text-white/55">{suffix}</span>
            ) : (
              <span className="text-lg text-white/55">one-time</span>
            )}
          </div>
          {billingNote ? (
            <p className="mt-1.5 text-sm text-white/55">{billingNote} · Cancel anytime</p>
          ) : (
            <p className="mt-1.5 text-sm text-white/55">Cancel anytime</p>
          )}
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
          What&apos;s included
        </p>
        <ul className="space-y-3">
          {featureList.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <CheckCircle2 className="size-3 text-white" />
              </div>
              <span className="text-sm text-white/80">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-white/10" />

      <div className="space-y-3">
        <PricingRow label="Subtotal" value={subtotal} />
        <PricingRow label="Tax" value="$0.00" />
        <div className="h-px bg-white/10" />
        <PricingRow label="Total due today" value={subtotal} bold />
      </div>

      <div className="mt-auto space-y-2.5 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <Lock className="size-3.5 shrink-0 text-white/40" />
          <span className="text-xs text-white/45">256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-white/40" />
          <span className="text-xs text-white/45">Cancel or change your plan anytime</span>
        </div>
      </div>
    </aside>
  )
}
