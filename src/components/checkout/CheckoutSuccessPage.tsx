'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { syncSubscription } from '@/lib/api/supervision'
import { useUser } from '@/lib/contexts/UserContext'
import { useConfetti } from '@/lib/hooks/useConfetti'
import { subscriptionKeys } from '@/lib/hooks/useSubscriptionPlans'
import { isSafeInternalPath } from '@/lib/utils/safe-redirect'

/**
 * Handles the Stripe return_url redirect after stripe.confirmPayment().
 *
 * Stripe appends these query params:
 *   - redirect_status: "succeeded" | "processing" | "requires_payment_method"
 *   - payment_intent: pi_xxx
 *   - payment_intent_client_secret: pi_xxx_secret_xxx
 */
const PAYMENT_COMPLETE_STATUSES = new Set(['succeeded', 'processing'])

/** Delay before auto-returning to the page the user came from (post-payment). */
const AUTO_REDIRECT_DELAY_SECONDS = 10

/**
 * The plan turns active when Stripe confirms the invoice, a few seconds after
 * the redirect. The page asks the backend to sync from Stripe until it is, so
 * it never says "subscribed" (or caches the old plan) too early.
 */
const SYNC_ATTEMPTS = 8
const SYNC_INTERVAL_MS = 1500

type Confirmation = 'confirming' | 'confirmed' | 'delayed'

export function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('redirect_status')
  const redirectParam = searchParams.get('redirect')
  const continuePath = isSafeInternalPath(redirectParam) ? redirectParam : null
  const router = useRouter()
  const queryClient = useQueryClient()
  const { refreshUser } = useUser()
  const { fireworks } = useConfetti()

  const [confirmation, setConfirmation] = useState<Confirmation>('confirming')

  useEffect(() => {
    if (!PAYMENT_COMPLETE_STATUSES.has(status ?? '')) return
    let cancelled = false

    // Refresh everything that shows the plan (dashboard checklist, billing, profile).
    const invalidateAll = () =>
      Promise.all([
        refreshUser(),
        queryClient.invalidateQueries({ queryKey: ['supervisee-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['supervisor-profile'] }),
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
      ])

    async function confirmPlan() {
      let activated = false
      for (let attempt = 0; attempt < SYNC_ATTEMPTS && !cancelled; attempt++) {
        try {
          activated = (await syncSubscription()).activated
        } catch {
          // A failed check just tries again.
        }
        if (activated || cancelled) break
        await new Promise((resolve) => setTimeout(resolve, SYNC_INTERVAL_MS))
      }
      if (cancelled) return
      await invalidateAll()
      if (!cancelled) setConfirmation(activated ? 'confirmed' : 'delayed')
    }

    if (status === 'succeeded') void confirmPlan()
    else void invalidateAll()

    return () => {
      cancelled = true
    }
  }, [status, queryClient, refreshUser])

  useEffect(() => {
    if (status !== 'succeeded' || confirmation !== 'confirmed') return
    const id = setTimeout(() => fireworks(), 400)
    return () => clearTimeout(id)
  }, [status, confirmation, fireworks])

  // When checkout was started from another page (e.g. a supervisee profile),
  // send the user back there automatically so they can finish what they started.
  // A visible countdown keeps the wait from feeling like a hang.
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_DELAY_SECONDS)
  useEffect(() => {
    if (status !== 'succeeded' || confirmation !== 'confirmed' || !continuePath) return
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    const id = setTimeout(() => router.push(continuePath), AUTO_REDIRECT_DELAY_SECONDS * 1000)
    return () => {
      clearInterval(interval)
      clearTimeout(id)
    }
  }, [status, confirmation, continuePath, router])

  if (status === 'succeeded' && confirmation === 'confirming') {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#008542]/10">
          <Loader2 className="size-8 animate-spin text-[#008542]" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Confirming your subscription
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Payment received. This only takes a few seconds.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'succeeded' && confirmation === 'delayed') {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <CheckCircle2 className="size-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment received</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your plan is taking a little longer to switch on. Check your dashboard in a minute. If
            it still isn&apos;t active, contact support and we&apos;ll sort it out.
          </p>
        </div>
        <Link
          href={continuePath ?? '/dashboard'}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {continuePath ? 'Continue' : 'Go to Dashboard'}
        </Link>
      </div>
    )
  }

  if (status === 'succeeded') {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#008542]/10">
          <CheckCircle2 className="size-8 text-[#008542]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            You&apos;re subscribed
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {continuePath
              ? `Payment received. Taking you back to where you were in ${secondsLeft}s…`
              : 'Payment received. Your plan is active, so you can now accept supervision requests and message supervisees.'}
          </p>
        </div>

        <Link
          href={continuePath ?? '/dashboard'}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {continuePath ? 'Continue Now' : 'Go to Dashboard'}
        </Link>

        {continuePath && (
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Go to Dashboard instead
          </Link>
        )}
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <CheckCircle2 className="size-8 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your payment is processing
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            This usually takes a minute. We&apos;ll email you as soon as it goes through.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  // status === 'requires_payment_method' or anything else — payment failed
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="size-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Failed</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We weren&apos;t able to process your payment. Please check your card details and try
          again.
        </p>
      </div>

      <Link
        href="/checkout"
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try Again
      </Link>
    </div>
  )
}
