'use client'

import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DialogContent, DialogRoot, DialogTitle } from '@/components/ui/dialog'
import { useSubscriptionPlansMutation } from '@/lib/hooks/useSubscriptionPlans'
import { cn } from '@/lib/utils'

const FREE_FEATURES = [
  'Browse supervisor profiles',
  'View session availability',
  'Track goals & progress',
  'Access session history (limited)',
]

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Browse verified supervisors',
  'Direct messaging with supervisors',
  'Availability & scheduling tools',
  'View contact details',
  'Priority supervisor matching',
]

const MONTHLY_PRICE = 99
const ANNUAL_MONTHLY_PRICE = 79

interface SubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const loadPlans = useSubscriptionPlansMutation()

  const price = billing === 'monthly' ? MONTHLY_PRICE : ANNUAL_MONTHLY_PRICE

  function handleSubscribeNow() {
    loadPlans.mutate(undefined, {
      onError: (err) => {
        console.warn('[Subscribe Now] GET /supervision/plans failed', err)
      },
      onSettled: () => {
        onOpenChange(false)
        router.push(`/checkout?billing=${billing}`)
      },
    })
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-10" aria-describedby={undefined}>
        {/* Header */}
        <div className="mb-7 text-center">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Choose your plan
          </DialogTitle>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Unlock the full Gotham experience. Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={cn(
                'rounded-md px-5 py-1.5 text-sm font-semibold transition-all',
                billing === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={cn(
                'rounded-md px-5 py-1.5 text-sm font-semibold transition-all',
                billing === 'annual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Annual
            </button>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Save 20% annually
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-2 gap-5">
          {/* Free plan */}
          <div className="flex flex-col rounded-xl border border-border p-6">
            <div className="mb-5">
              <p className="text-base font-bold text-foreground">Free</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">$0</span>
                <span className="text-sm text-muted-foreground">/mo.</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Basic access to browse supervisors and explore the platform.
              </p>
            </div>

            <ul className="mb-6 flex-1 space-y-2.5">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border border-border py-3 text-center">
              <span className="text-sm font-semibold text-muted-foreground">Current plan</span>
            </div>
          </div>

          {/* Premium plan */}
          <div className="relative flex flex-col rounded-xl border-2 border-primary bg-primary/5 p-6">
            <div className="absolute -top-px right-5 rounded-b-lg bg-primary px-3 py-1">
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                Most Popular
              </span>
            </div>

            <div className="mb-5">
              <p className="text-base font-bold text-primary">Premium</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  ${price}
                </span>
                <span className="text-sm text-muted-foreground">/mo.</span>
              </div>
              {billing === 'annual' && (
                <p className="mt-1 text-xs text-primary">
                  Billed annually (${ANNUAL_MONTHLY_PRICE * 12}/yr)
                </p>
              )}
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Full access to messaging, scheduling tools, and priority support.
              </p>
            </div>

            <ul className="mb-6 flex-1 space-y-2.5">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleSubscribeNow}
              disabled={loadPlans.isPending}
              className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadPlans.isPending ? 'Loading…' : 'Subscribe Now'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Have questions?{' '}
          <span className="cursor-pointer font-semibold text-primary underline underline-offset-2">
            Contact support
          </span>
        </p>
      </DialogContent>
    </DialogRoot>
  )
}
