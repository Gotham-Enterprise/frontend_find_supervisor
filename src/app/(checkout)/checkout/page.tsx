import type { Metadata } from 'next'

import { CheckoutPage } from '@/components/checkout'

export const metadata: Metadata = {
  title: 'Checkout | Find A Supervisor',
}

export default function CheckoutRoutePage() {
  return <CheckoutPage />
}
