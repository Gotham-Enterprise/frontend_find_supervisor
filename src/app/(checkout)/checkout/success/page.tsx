import type { Metadata } from 'next'
import { Suspense } from 'react'

import { CheckoutSuccessPage } from '@/components/checkout/CheckoutSuccessPage'

export const metadata: Metadata = {
  title: 'Subscription Activated | Find A Supervisor',
}

export default function CheckoutSuccessRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
          Confirming your subscription…
        </div>
      }
    >
      <CheckoutSuccessPage />
    </Suspense>
  )
}
