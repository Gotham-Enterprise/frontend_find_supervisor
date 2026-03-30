'use client'

import { CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Card brand logos ─────────────────────────────────────────────────────────

function CardBrandLogos() {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-black tracking-tight text-[#1A1F71]">
        VISA
      </span>
      <span className="flex items-center rounded border border-border px-1 py-0.5">
        <span className="inline-block size-3.5 rounded-full bg-[#EB001B]" />
        <span className="-ml-1.5 inline-block size-3.5 rounded-full bg-[#F79E1B]" />
      </span>
    </div>
  )
}

// ─── Card payment placeholder ─────────────────────────────────────────────────
// TODO: Replace the inputs below with Stripe Elements <CardElement /> once
//       Stripe is wired in. The container styling and layout should remain.

function CardPaymentSection() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5">
      {/* Row: label + card brands */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CreditCard className="size-4 text-muted-foreground" />
          Card
        </div>
        <CardBrandLogos />
      </div>

      <div className="space-y-4">
        {/* Name on card */}
        <div className="space-y-1.5">
          <Label htmlFor="cardName" className="text-xs font-medium text-muted-foreground">
            Name on card
          </Label>
          <Input id="cardName" type="text" placeholder="Sarah Johnson" autoComplete="cc-name" />
        </div>

        {/* Card number */}
        <div className="space-y-1.5">
          <Label htmlFor="cardNumber" className="text-xs font-medium text-muted-foreground">
            Card number
          </Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            autoComplete="cc-number"
            inputMode="numeric"
            endAdornment={<CreditCard className="size-4 text-muted-foreground/50" />}
          />
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="expiry" className="text-xs font-medium text-muted-foreground">
              Expiration date
            </Label>
            <Input
              id="expiry"
              type="text"
              placeholder="MM / YY"
              autoComplete="cc-exp"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cvc" className="text-xs font-medium text-muted-foreground">
              CVC
            </Label>
            <Input
              id="cvc"
              type="text"
              placeholder="123"
              autoComplete="cc-csc"
              inputMode="numeric"
              maxLength={4}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main form component ──────────────────────────────────────────────────────

export function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: integrate Stripe payment intent / subscription creation
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1500)
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
        {/* Contact information */}
        <section>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Contact information
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </section>

        {/* Payment method */}
        <section>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Payment method
          </p>
          <CardPaymentSection />
        </section>

        {/* Submit */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="size-3.5" />
            {isLoading ? 'Processing…' : 'Subscribe Now — $99/month'}
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
