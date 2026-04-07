'use client'

import { CheckCircle2, Star } from 'lucide-react'
import { useState } from 'react'

import {
  FreeFeatureRow,
  LockedFeatureRow,
  PremiumFeaturesDivider,
} from '@/components/Dashboard/subscription/SubscriptionFeatureRows'
import { SubscriptionModal } from '@/components/Dashboard/subscription/SubscriptionModal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FeatureItem {
  label: string
  premium: boolean
}

const FEATURES: FeatureItem[] = [
  { label: 'Browse verified supervisors', premium: false },
  { label: 'Send supervision requests', premium: false },
  { label: 'Track your goals & progress', premium: false },
  { label: 'View session history', premium: false },
  { label: 'View supervisor contact details', premium: true },
  { label: 'Message supervisors directly', premium: true },
  { label: 'Priority supervisor matching', premium: true },
  { label: 'Enhanced communication tools', premium: true },
]

function UnsubscribedCard() {
  const [modalOpen, setModalOpen] = useState(false)
  const freeFeatures = FEATURES.filter((f) => !f.premium)
  const premiumFeatures = FEATURES.filter((f) => f.premium)

  return (
    <>
      <SubscriptionModal open={modalOpen} onOpenChange={setModalOpen} />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Star className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Unlock the Full Experience</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Subscribe to access supervisor contact details, direct messaging, and more.
              </p>
            </div>
          </div>
          <Badge className="shrink-0 bg-muted text-muted-foreground hover:bg-muted">
            Free Plan
          </Badge>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Feature checklist */}
            <div className="lg:col-span-2">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Included for Free
              </p>
              <ul className="space-y-2.5">
                {freeFeatures.map((f) => (
                  <FreeFeatureRow key={f.label} label={f.label} />
                ))}
              </ul>

              <PremiumFeaturesDivider />

              <ul className="space-y-2.5">
                {premiumFeatures.map((f) => (
                  <LockedFeatureRow key={f.label} label={f.label} />
                ))}
              </ul>
            </div>

            {/* Right: CTA panel */}
            <div className="self-start rounded-xl border border-border bg-muted/40 p-5 lg:col-span-1">
              <p className="text-sm font-semibold text-foreground">Ready to unlock more?</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Subscribe and get instant access to supervisor contact details, messaging, and
                priority matching.
              </p>

              <ul className="mt-4 space-y-2">
                {['View contact details', 'Direct messaging', 'Priority matching'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Star className="size-3.5" />
                Subscribe Now
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Cancel anytime · No hidden fees
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function formatBillingDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SubscriptionSectionSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-muted/60" />
      </CardHeader>
      <CardContent className="pt-5">
        <div className="h-40 animate-pulse rounded-xl bg-muted/40" />
      </CardContent>
    </Card>
  )
}

function SubscribedCard({
  planName,
  currentPeriodEnd,
}: {
  planName: string
  currentPeriodEnd: string | null | undefined
}) {
  const nextBilling = formatBillingDate(currentPeriodEnd)

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-emerald-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="size-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Your Subscription is Active</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You have full access to all platform features. Enjoy the complete experience.
            </p>
          </div>
        </div>
        <Badge className="shrink-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          ● Premium Active
        </Badge>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: All features unlocked */}
          <div className="lg:col-span-2">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              All Features Unlocked
            </p>
            <ul className="space-y-2.5">
              {FEATURES.map((f) => (
                <FreeFeatureRow key={f.label} label={f.label} />
              ))}
            </ul>
          </div>

          {/* Right: Subscription status */}
          <div className="self-start rounded-xl border border-emerald-200 bg-emerald-50 p-5 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <CheckCircle2 className="size-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Subscription Active</p>
                <p className="text-xs text-emerald-600">All features unlocked</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-emerald-200 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700">Current plan</span>
                <span className="font-semibold text-emerald-800">{planName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700">Next billing</span>
                <span className="text-emerald-700">{nextBilling}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
            >
              Manage Subscription
            </button>
            <p className="mt-2 text-center text-[11px] text-emerald-600">
              Auto-renews · Cancel anytime
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SuperviseeDashboardSubscriptionProps {
  /** While true, show a skeleton instead of defaulting to “free” (avoids flash after checkout). */
  isProfileLoading?: boolean
  isSubscribed?: boolean
  planName?: string | null
  currentPeriodEnd?: string | null
}

export function SuperviseeDashboardSubscription({
  isProfileLoading = false,
  isSubscribed = false,
  planName,
  currentPeriodEnd,
}: SuperviseeDashboardSubscriptionProps) {
  if (isProfileLoading) {
    return <SubscriptionSectionSkeleton />
  }

  if (!isSubscribed) {
    return <UnsubscribedCard />
  }

  const resolvedPlan = planName?.trim() || 'Premium plan'
  return <SubscribedCard planName={resolvedPlan} currentPeriodEnd={currentPeriodEnd} />
}
