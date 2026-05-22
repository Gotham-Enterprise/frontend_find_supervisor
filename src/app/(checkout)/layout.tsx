import type { Metadata } from 'next'

import { CheckoutShellLayout } from '@/components/Layout/checkout-shell-layout'
import { noIndexMetadata } from '@/lib/seo/config'

export const metadata: Metadata = {
  ...noIndexMetadata,
}

export default function CheckoutRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutShellLayout>{children}</CheckoutShellLayout>
}
