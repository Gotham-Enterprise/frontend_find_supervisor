'use client'

import { AlertCircle, CheckCircle2, Clock, ExternalLink, Landmark, RefreshCw } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreatePayoutDashboardLink,
  usePayoutStatusQuery,
  useStartPayoutOnboarding,
  useUserSnackbar,
} from '@/lib/hooks'
import { parseApiError } from '@/lib/utils/error-parser'
import type { PayoutAccountStatus } from '@/types/payouts'

const STATUS_CONFIG: Record<
  PayoutAccountStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  not_started: { label: 'Not set up', variant: 'outline' },
  incomplete: { label: 'Incomplete', variant: 'outline' },
  action_required: { label: 'Action required', variant: 'destructive' },
  pending: { label: 'Verifying', variant: 'secondary' },
  ready: { label: 'Ready', variant: 'default' },
}

/**
 * Stripe sends supervisors back to /billing?payouts=return when they finish
 * onboarding, or ?payouts=refresh when the single-use link expired — in that
 * case a fresh link is requested and they are sent straight back to Stripe.
 */
function PayoutsReturnHandler({ onRefreshLink }: { onRefreshLink: () => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const handled = useRef(false)
  const payoutsParam = searchParams.get('payouts')

  useEffect(() => {
    if (!payoutsParam || handled.current) return
    handled.current = true
    if (payoutsParam === 'refresh') {
      onRefreshLink()
      return
    }
    router.replace(pathname, { scroll: false })
  }, [payoutsParam, onRefreshLink, router, pathname])

  return null
}

export function PayoutsCard() {
  const { data, isLoading, isError, refetch } = usePayoutStatusQuery(true)
  const { mutate: startOnboarding, isPending: isStarting } = useStartPayoutOnboarding()
  const { mutateAsync: createDashboardLink, isPending: isOpeningDashboard } =
    useCreatePayoutDashboardLink()
  const { showError } = useUserSnackbar()

  function handleStartOnboarding() {
    startOnboarding(undefined, { onError: (error) => showError(parseApiError(error)) })
  }

  async function handleOpenDashboard() {
    // Open the tab synchronously (inside the click) so popup blockers allow it,
    // then point it at the single-use login link once it's created.
    const tab = window.open('', '_blank')
    try {
      const { url } = await createDashboardLink()
      if (tab) tab.location.href = url
      else window.location.assign(url)
    } catch (error) {
      tab?.close()
      showError(parseApiError(error))
    }
  }

  const status = data?.status
  const config = status ? STATUS_CONFIG[status] : null

  return (
    <Card className="max-w-2xl">
      <Suspense fallback={null}>
        <PayoutsReturnHandler onRefreshLink={handleStartOnboarding} />
      </Suspense>

      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Landmark className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle>Payouts</CardTitle>
              <CardDescription className="mt-0.5">
                Receive supervisee payments directly to your bank account.
              </CardDescription>
            </div>
          </div>
          {config && (
            <Badge variant={config.variant} className="mt-0.5 shrink-0">
              {config.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-9 w-40" />
          </div>
        ) : isError || !status ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your payout status.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <PayoutStatusMessage status={status} requirementsDueCount={data.requirementsDueCount} />

            <div className="flex flex-wrap justify-end gap-2">
              {status === 'ready' ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isOpeningDashboard}
                  onClick={() => void handleOpenDashboard()}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isOpeningDashboard ? 'Opening…' : 'View payouts'}
                </Button>
              ) : (
                <>
                  {status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => void refetch()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check status
                    </Button>
                  )}
                  {status !== 'pending' && (
                    <Button size="sm" disabled={isStarting} onClick={handleStartOnboarding}>
                      {isStarting ? 'Redirecting to Stripe…' : ONBOARDING_CTA[status]}
                    </Button>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Payouts are handled securely by Stripe. Your bank and identity details are never
              stored by Find a Supervisor.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const ONBOARDING_CTA: Record<Exclude<PayoutAccountStatus, 'ready' | 'pending'>, string> = {
  not_started: 'Set up payouts',
  incomplete: 'Continue setup',
  action_required: 'Update details',
}

function PayoutStatusMessage({
  status,
  requirementsDueCount,
}: {
  status: PayoutAccountStatus
  requirementsDueCount: number
}) {
  switch (status) {
    case 'ready':
      return (
        <p className="flex items-start gap-2 text-sm text-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          You&apos;re ready to receive payments from supervisees.
        </p>
      )
    case 'pending':
      return (
        <p className="flex items-start gap-2 text-sm text-foreground">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          Stripe is verifying your details. This usually takes a few minutes but can take longer.
        </p>
      )
    case 'action_required':
      return (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Stripe needs more information before you can receive payments
            {requirementsDueCount > 0 ? ` (${requirementsDueCount} item(s) outstanding)` : ''}.
          </span>
        </div>
      )
    case 'incomplete':
      return (
        <p className="text-sm text-muted-foreground">
          You started setting up payouts but haven&apos;t finished. Continue where you left off.
        </p>
      )
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Set up a payout account to get paid by supervisees through Find a Supervisor. You&apos;ll
          be redirected to Stripe to verify your identity and add your bank account.
        </p>
      )
  }
}
