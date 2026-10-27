import type { Metadata } from 'next'
import { Suspense } from 'react'

import { CheckoutPage } from '@/components/checkout'

export const metadata: Metadata = {
  title: 'Checkout',
}

export default function CheckoutRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
          Loading checkout…
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  )
}
