import { CheckoutForm } from './CheckoutForm'
import { CheckoutSummaryPanel } from './CheckoutSummaryPanel'

export function CheckoutPage() {
  return (
    <div className="flex min-h-full flex-col overflow-hidden rounded-xl border border-border shadow-sm lg:flex-row">
      <CheckoutSummaryPanel />
      <CheckoutForm />
    </div>
  )
}
