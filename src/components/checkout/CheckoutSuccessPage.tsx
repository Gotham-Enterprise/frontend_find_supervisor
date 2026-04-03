'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

/**
 * Handles the Stripe return_url redirect after stripe.confirmPayment().
 *
 * Stripe appends these query params:
 *   - redirect_status: "succeeded" | "processing" | "requires_payment_method"
 *   - payment_intent: pi_xxx
 *   - payment_intent_client_secret: pi_xxx_secret_xxx
 */
export function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get('redirect_status')

  if (status === 'succeeded') {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#008542]/10">
          <CheckCircle2 className="size-8 text-[#008542]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Subscription Activated!
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your payment was successful. You now have full access to the platform — welcome aboard!
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

  if (status === 'processing') {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <CheckCircle2 className="size-8 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Payment Processing</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your payment is being processed. This usually takes just a moment. We&apos;ll send you a
            confirmation email once it&apos;s complete.
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
