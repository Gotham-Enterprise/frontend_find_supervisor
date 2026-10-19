'use client'

import { BillingPanel } from '@/components/Billing'
import { SuperviseeBillingPanel } from '@/components/Billing/SuperviseeBillingPanel'
import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'

/** /billing: subscription + payouts for supervisors, saved cards + payment history for supervisees. */
export function BillingByRole() {
  const { user, isLoading } = useUser()
  if (isLoading) return null
  if (isSuperviseeRole(user?.role)) return <SuperviseeBillingPanel />
  return <BillingPanel />
}
