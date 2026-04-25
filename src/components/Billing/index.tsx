'use client'

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  RefreshCw,
  Star,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import {
  FreeFeatureRow,
  LockedFeatureRow,
  PremiumFeaturesDivider,
} from '@/components/Dashboard/subscription/SubscriptionFeatureRows'
import { SubscriptionModal } from '@/components/Dashboard/subscription/SubscriptionModal'
import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { isSupervisorRole } from '@/lib/auth/roles'
import { isSupervisionFreeTierSubscription } from '@/lib/constants/supervision-dashboard-plans'
import {
  useCancelSubscription,
  useCurrentSubscriptionQuery,
  useUser,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import type { Subscription, SubscriptionStatus } from '@/types/supervisor-profile'

// ─── Feature list shared with the dashboard upgrade cards ─────────────────────

const SUPERVISOR_FEATURES = [
  { label: 'Receive and respond to supervisee requests', premium: false },
  { label: 'See visibility into interested supervisees', premium: false },
  { label: 'Basic profile listing in search', premium: false },
  { label: 'Platform notifications for new activity', premium: false },
  { label: 'Full messaging with supervisees', premium: true },
  { label: 'View supervisee contact details where applicable', premium: true },
  { label: 'Improved discoverability and profile exposure', premium: true },
  { label: 'Unlock full supervisor platform tools', premium: true },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function formatBillingCycle(cycle: string | null | undefined): string {
  if (!cycle) return '—'
  const map: Record<string, string> = {
    MONTHLY: 'Monthly',
    ANNUAL: 'Annual',
    YEARLY: 'Yearly',
  }
  return map[cycle.toUpperCase()] ?? cycle
}

function getStatusConfig(status: SubscriptionStatus, cancelAtPeriodEnd?: boolean) {
  if (cancelAtPeriodEnd && (status === 'ACTIVE' || status === 'TRIALING')) {
    return {
      label: 'Canceling',
      variant: 'outline' as const,
      icon: <XCircle className="h-3.5 w-3.5" />,
    }
  }
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Active',
        variant: 'default' as const,
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      }
    case 'TRIALING':
      return {
        label: 'Trial',
        variant: 'secondary' as const,
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      }
    case 'PAST_DUE':
      return {
        label: 'Past Due',
        variant: 'destructive' as const,
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      }
    case 'CANCELED':
      return {
        label: 'Canceled',
        variant: 'outline' as const,
        icon: <XCircle className="h-3.5 w-3.5" />,
      }
    default:
      return { label: status, variant: 'outline' as const, icon: null }
  }
}

function isActiveSubscription(sub: Subscription): boolean {
  return ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(sub.status) && !sub.cancelAtPeriodEnd
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Error state ───────────────────────────────────────────────────────────────

function BillingError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="max-w-2xl border-destructive/40 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div>
          <p className="font-medium text-sm">Failed to load subscription</p>
          <p className="text-xs text-muted-foreground mt-1">
            We could not retrieve your subscription details. Please try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Subscription info row ─────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

// ─── Free-plan upgrade card ────────────────────────────────────────────────────

function FreePlanUpgradeCard({ planName }: { planName: string }) {
  const [modalOpen, setModalOpen] = useState(false)
  const freeFeatures = SUPERVISOR_FEATURES.filter((f) => !f.premium)
  const premiumFeatures = SUPERVISOR_FEATURES.filter((f) => f.premium)

  return (
    <>
      <SubscriptionModal open={modalOpen} onOpenChange={setModalOpen} />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Star className="size-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                You&apos;re on the free plan
              </CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Basic supervisor tools are included. Upgrade for messaging, richer visibility, and
                full platform access.
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
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current plan
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{planName}</p>
              <p className="mt-3 text-sm font-semibold text-foreground">Unlock premium tools</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Move to Find a Supervisor Platform Access when you&apos;re ready for the full
                supervisor experience.
              </p>

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

// ─── No-subscription upgrade card ─────────────────────────────────────────────

function NoSubscriptionUpgradeCard() {
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

// ─── Paid subscription card ────────────────────────────────────────────────────

function SubscriptionCard({
  subscription,
  onCancelClick,
}: {
  subscription: Subscription
  onCancelClick: () => void
}) {
  const statusConfig = getStatusConfig(subscription.status, subscription.cancelAtPeriodEnd)
  const canCancel = isActiveSubscription(subscription)
  const isCancelingAtEnd = subscription.cancelAtPeriodEnd && subscription.status !== 'CANCELED'

  return (
    <Card className="max-w-2xl">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription className="mt-0.5">
              Your active plan and billing details.
            </CardDescription>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1 shrink-0 mt-0.5">
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <InfoRow label="Plan" value={subscription.plan.name} />
          <InfoRow
            label="Price"
            value={
              subscription.plan.priceInCents === 0
                ? 'Free'
                : formatCents(subscription.plan.priceInCents)
            }
          />
          <InfoRow
            label="Billing Cycle"
            value={formatBillingCycle(subscription.plan.billingCycle)}
          />
          <InfoRow
            label={isCancelingAtEnd ? 'Access Until' : 'Renews On'}
            value={
              <span className={isCancelingAtEnd ? 'text-amber-600' : undefined}>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </span>
            }
          />
        </div>

        {isCancelingAtEnd && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your subscription is set to cancel at the end of the current billing period. You will
            retain access until{' '}
            <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>.
          </div>
        )}

        {canCancel && (
          <div className="mt-6 flex justify-end">
            <Button variant="destructive" size="sm" onClick={onCancelClick}>
              Cancel Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Invoices section ──────────────────────────────────────────────────────────

function InvoicesCard() {
  return (
    <Card className="max-w-2xl">
      <CardHeader className="border-b">
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Download or view your past billing invoices.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invoice history will appear here once it is available.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

function BillingContent() {
  const { user } = useUser()
  const isSupervisor = isSupervisorRole(user?.role)

  const {
    data: subscription,
    isLoading,
    isError,
    refetch,
  } = useCurrentSubscriptionQuery(isSupervisor)

  const { mutateAsync: cancelSub, isPending: isCanceling } = useCancelSubscription()
  const { showSuccess, showError } = useUserSnackbar()

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleConfirmCancel() {
    try {
      await cancelSub()
      setConfirmOpen(false)
      showSuccess('Subscription canceled.', {
        description: 'Your access will remain active until the end of the current billing period.',
      })
    } catch (error) {
      showError(parseApiError(error))
    }
  }

  // Determine if the supervisor is on the free tier (by price, canonical name, or
  // a non-entitled status). INACTIVE = checkout started but payment not confirmed;
  // CANCELED / UNPAID = subscription ended. All of these should show the upgrade
  // prompt, not the paid subscription card.
  const NON_ENTITLED_STATUSES: SubscriptionStatus[] = ['INACTIVE', 'CANCELED', 'UNPAID']
  const isFreeTier =
    !isLoading &&
    !isError &&
    (subscription == null ||
      NON_ENTITLED_STATUSES.includes(subscription.status) ||
      isSupervisionFreeTierSubscription(subscription.plan?.name, subscription.plan ?? undefined))

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Billing &amp; Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription, billing details, and invoices.
        </p>
      </div>

      {isLoading ? (
        <BillingSkeleton />
      ) : isError ? (
        <BillingError onRetry={() => void refetch()} />
      ) : isFreeTier ? (
        // Free or no subscription — show upgrade prompt only, no invoices
        subscription ? (
          <FreePlanUpgradeCard planName={subscription.plan.name || 'Find a Supervisor Free Plan'} />
        ) : (
          <NoSubscriptionUpgradeCard />
        )
      ) : (
        // Paid subscription — show subscription card + invoices
        <>
          <SubscriptionCard
            subscription={subscription!}
            onCancelClick={() => setConfirmOpen(true)}
          />
          <InvoicesCard />
        </>
      )}

      {/* Cancel confirmation dialog — only rendered for paid subscribers */}
      {!isFreeTier && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Cancel Subscription?"
          description="Your subscription will remain active until the end of the current billing period. After that, you will lose access to paid features. This action cannot be undone."
          confirmLabel="Yes, Cancel Subscription"
          cancelLabel="Keep Subscription"
          destructive
          isPending={isCanceling}
          onConfirm={() => void handleConfirmCancel()}
        />
      )}
    </div>
  )
}

export function BillingPanel() {
  return (
    <SupervisorRouteGuard>
      <BillingContent />
    </SupervisorRouteGuard>
  )
}
