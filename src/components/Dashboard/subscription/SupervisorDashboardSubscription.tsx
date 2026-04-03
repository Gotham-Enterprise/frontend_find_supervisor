'use client'

import { CheckCircle2, Star } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { FreeFeatureRow, LockedFeatureRow, PremiumFeaturesDivider } from './SubscriptionFeatureRows'
import { SubscriptionModal } from './SubscriptionModal'

interface FeatureItem {
  label: string
  premium: boolean
}

const SUPERVISOR_FEATURES: FeatureItem[] = [
  { label: 'Receive and respond to supervisee requests', premium: false },
  { label: 'See visibility into interested supervisees', premium: false },
  { label: 'Basic profile listing in search', premium: false },
  { label: 'Platform notifications for new activity', premium: false },
  { label: 'Full messaging with supervisees', premium: true },
  { label: 'View supervisee contact details where applicable', premium: true },
  { label: 'Improved discoverability and profile exposure', premium: true },
  { label: 'Unlock full supervisor platform tools', premium: true },
]

function formatBillingDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function UnsubscribedCard() {
  const [modalOpen, setModalOpen] = useState(false)
  const freeFeatures = SUPERVISOR_FEATURES.filter((f) => !f.premium)
  const premiumFeatures = SUPERVISOR_FEATURES.filter((f) => f.premium)

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
              <CardTitle className="text-base font-semibold">Supervisor subscription</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Upgrade to reach supervisees with messaging, stronger visibility, and full platform
                tools.
              </p>
            </div>
          </div>
          <Badge className="shrink-0 bg-muted text-muted-foreground hover:bg-muted">
            Free Plan
          </Badge>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Included for free
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

            <div className="self-start rounded-xl border border-border bg-muted/40 p-5 lg:col-span-1">
              <p className="text-sm font-semibold text-foreground">
                Unlock premium for supervisors
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Get messaging, richer contact context, and tools designed for active supervisors.
              </p>

              <ul className="mt-4 space-y-2">
                {['Messaging & contacts', 'Stronger visibility', 'Full platform tools'].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Star className="size-3.5" />
                Upgrade plan
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

function SubscribedCard({
  planName,
  nextBillingDate,
}: {
  planName: string
  nextBillingDate: string
}) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-emerald-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="size-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Your supervisor plan is active
            </CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You have access to premium supervisor features including messaging, visibility, and
              platform tools.
            </p>
          </div>
        </div>
        <Badge className="shrink-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          ● Premium active
        </Badge>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Included in your plan
            </p>
            <ul className="space-y-2.5">
              {SUPERVISOR_FEATURES.map((f) => (
                <FreeFeatureRow key={f.label} label={f.label} />
              ))}
            </ul>
          </div>

          <div className="self-start rounded-xl border border-emerald-200 bg-emerald-50 p-5 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <CheckCircle2 className="size-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Subscription active</p>
                <p className="text-xs text-emerald-600">Premium features enabled</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-emerald-200 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700">Current plan</span>
                <span className="font-semibold text-emerald-800">{planName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-700">Next billing</span>
                <span className="text-emerald-700">{nextBillingDate}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
            >
              Manage subscription
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

export interface SupervisorDashboardSubscriptionProps {
  isSubscribed: boolean
  /** Display name for the active plan (e.g. from API) */
  planName?: string | null
  /** ISO date string for next billing period end */
  currentPeriodEnd?: string | null
}

export function SupervisorDashboardSubscription({
  isSubscribed,
  planName,
  currentPeriodEnd,
}: SupervisorDashboardSubscriptionProps) {
  if (!isSubscribed) {
    return <UnsubscribedCard />
  }

  const resolvedPlan = planName?.trim() || 'Supervisor Pro'
  const nextBilling = formatBillingDate(currentPeriodEnd ?? null)

  return <SubscribedCard planName={resolvedPlan} nextBillingDate={nextBilling} />
}
