import { CheckoutShellLayout } from '@/components/Layout/checkout-shell-layout'

export default function CheckoutRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutShellLayout>{children}</CheckoutShellLayout>
}
