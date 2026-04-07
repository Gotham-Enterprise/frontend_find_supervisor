'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { AlertCircle, CheckCircle2, Lock, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { purchaseSubscription } from '@/lib/api/supervision'
import { useCheckoutPlanFromUrl } from '@/lib/hooks/useCheckoutPlanFromUrl'
import { parseApiError } from '@/lib/utils/error-parser'
import { formatBillingCycleSuffix, formatPlanPriceFromCents } from '@/lib/utils/plan-formatting'
import type { SubscriptionPlan } from '@/types/supervisor-profile'

// Stripe publishable key — safe to expose in client code.
// loadStripe is called lazily so the module can load even when the key is absent.
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8 bg-card px-8 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-56 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted/60" />
        <div className="mt-6 h-48 w-full rounded-xl bg-muted/40" />
        <div className="h-12 w-full rounded-lg bg-muted/40" />
      </div>
    </div>
  )
}

// ─── Inner form — requires Stripe Elements context ────────────────────────────
// clientSecret is already bound to Elements; confirmPayment uses it automatically.

interface CheckoutFormInnerProps {
  plan: SubscriptionPlan
}

function CheckoutFormInner({ plan }: CheckoutFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ctaPrice = `${formatPlanPriceFromCents(plan.priceInCents)}${formatBillingCycleSuffix(plan.billingCycle) || ''}`

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!stripe || !elements || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    // clientSecret is already bound to the Elements instance — no need to pass it here.
    // Stripe collects and tokenises card details securely; we never touch them.
    // On success, Stripe redirects to return_url with ?redirect_status=succeeded.
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    })

    // confirmPayment only returns control here on failure (redirects on success)
    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please check your card and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 bg-card px-8 py-12">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Complete your subscription
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re one step away from unlocking the full platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Payment method — Stripe Payment Element */}
        <section>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Payment method
          </p>

          <PaymentElement
            options={{
              layout: 'tabs',
              wallets: { applePay: 'auto', googlePay: 'auto' },
            }}
          />
        </section>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="mt-px size-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || !stripe || !elements}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="size-3.5" />
            {isSubmitting ? 'Processing…' : `Subscribe Now — ${ctaPrice}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0" />
            Payments are securely processed by Stripe. Cancel anytime.
          </p>
        </div>
      </form>
    </div>
  )
}

// ─── Outer wrapper — initializes subscription on arrival, then mounts Elements ─

export function CheckoutForm() {
  const { plan, planId, canCheckout, isLoading: planLoading } = useCheckoutPlanFromUrl()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)

  // Track whether initialization has been kicked off to prevent double-calls.
  // A ref (not state) is used so the guard doesn't itself trigger re-renders.
  const initStarted = useRef(false)

  useEffect(() => {
    // Wait until the plan is resolved from the URL
    if (!planId || !plan || planLoading) return
    // Free plans do not go through Stripe — skip initialization
    if (!canCheckout) return
    // Don't re-initialize if already in flight or complete
    if (initStarted.current) return

    initStarted.current = true

    // Only touch state inside async callbacks — never synchronously in the effect body
    purchaseSubscription(planId)
      .then((result) => setClientSecret(result.clientSecret))
      .catch((err) => {
        setInitError(parseApiError(err))
        initStarted.current = false // allow retry
      })
  }, [planId, plan, planLoading, canCheckout])

  // "Initializing" is derived rather than tracked with separate state:
  // plan is resolved but we have neither a clientSecret nor an error yet.
  const isInitializing = !!plan && !clientSecret && !initError

  // ── Guard: Stripe not configured ──────────────────────────────────────────
  if (!stripePromise) {
    return (
      <div className="flex flex-1 flex-col gap-4 bg-card px-8 py-12">
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertCircle className="mt-px size-4 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-800">Stripe not configured</p>
            <p className="text-xs text-amber-700">
              Add{' '}
              <code className="rounded bg-amber-100 px-1 font-mono">
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              </code>{' '}
              to your <code className="rounded bg-amber-100 px-1 font-mono">.env.local</code> to
              enable checkout.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading — waiting for plan resolution or subscription init ────────────
  if (!planId || planLoading || isInitializing) {
    return <FormSkeleton />
  }

  // ── Plan not found ─────────────────────────────────────────────────────────
  if (!plan) {
    return (
      <div className="flex flex-1 flex-col gap-6 bg-card px-8 py-12">
        <p className="text-sm font-semibold text-foreground">Plan not found.</p>
        <p className="text-sm text-muted-foreground">
          Return to the dashboard and select a plan to continue.
        </p>
      </div>
    )
  }

  // ── Free plan — no payment required ────────────────────────────────────────
  if (!canCheckout) {
    return (
      <div className="flex flex-1 flex-col gap-6 bg-card px-8 py-12">
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-px size-4 shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-800">No payment required</p>
            <p className="text-xs text-emerald-700">
              {plan.name} is free. Return to the dashboard to start using the platform.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Initialization error (e.g. already subscribed, plan inactive) ──────────
  if (initError) {
    return (
      <div className="flex flex-1 flex-col gap-6 bg-card px-8 py-12">
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertCircle className="mt-px size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{initError}</p>
        </div>
      </div>
    )
  }

  // ── Happy path — clientSecret ready, mount Stripe Elements ────────────────
  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret!,
    appearance: {
      // 'flat' gives the cleanest canvas to apply our own design tokens
      theme: 'flat',
      variables: {
        // Brand
        colorPrimary: '#006d36',
        colorDanger: '#ef4444',

        // Surfaces & text — matched to globals.css tokens
        colorBackground: '#ffffff',
        colorText: '#181818',
        colorTextSecondary: '#6b7280',
        colorTextPlaceholder: '#9ca3af',

        // Border
        colorIconCardError: '#ef4444',

        // Typography — Geist Variable (loaded via @fontsource-variable/geist)
        fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
        fontSizeBase: '14px',
        fontWeightNormal: '400',
        fontWeightMedium: '500',
        fontWeightBold: '600',
        fontLineHeight: '1.5',

        // Shape — matches --radius: 0.625rem
        borderRadius: '10px',

        // Spacing
        spacingUnit: '4px',
        spacingGridRow: '20px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          color: '#181818',
          fontSize: '14px',
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingLeft: '12px',
          paddingRight: '12px',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        },
        '.Input:focus': {
          border: '1px solid #006d36',
          boxShadow: '0 0 0 3px rgba(0, 109, 54, 0.12)',
          outline: 'none',
        },
        '.Input--invalid': {
          border: '1px solid #ef4444',
          boxShadow: 'none',
        },
        '.Input--invalid:focus': {
          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.12)',
        },
        '.Label': {
          color: '#6b7280',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        },
        '.Tab': {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
          backgroundColor: '#ffffff',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'border-color 0.15s ease, color 0.15s ease',
        },
        '.Tab:hover': {
          border: '1px solid #d1ead9',
          color: '#181818',
        },
        '.Tab--selected': {
          border: '1px solid #006d36',
          color: '#006d36',
          fontWeight: '600',
        },
        '.Tab--selected:focus': {
          boxShadow: '0 0 0 3px rgba(0, 109, 54, 0.12)',
        },
        '.TabIcon--selected': {
          fill: '#006d36',
        },
        '.TabLabel--selected': {
          color: '#006d36',
        },
        '.Error': {
          color: '#ef4444',
          fontSize: '12px',
          marginTop: '4px',
        },
        '.Block': {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
          backgroundColor: '#f9fafb',
        },
        '.CheckboxInput': {
          border: '1px solid #e5e7eb',
        },
        '.CheckboxInput--checked': {
          backgroundColor: '#006d36',
          border: '1px solid #006d36',
        },
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutFormInner plan={plan} />
    </Elements>
  )
}
