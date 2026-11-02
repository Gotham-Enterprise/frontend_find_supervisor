import { IN_APP_MONTHLY_ENABLED } from '@/lib/constants/feature-flags'
import type { AgreementRecord, HireListItem } from '@/types/hire'

/**
 * Monthly terms billed in the app carry a platform fee; monthly agreements
 * paid outside the app (older ones, or with the flag off) don't.
 */
export function isInAppMonthlyAgreement(agreement: AgreementRecord | null | undefined): boolean {
  return (
    agreement != null &&
    agreement.monthlyAmount != null &&
    agreement.platformFeeBps != null &&
    agreement.hourlyRateCents == null
  )
}

/** The hire's agreement is billed monthly in the app (and the UI for it is on). */
export function usesInAppMonthlyBilling(hire: HireListItem): boolean {
  return IN_APP_MONTHLY_ENABLED && isInAppMonthlyAgreement(hire.agreement)
}

/** Last day of supervision ("Dec 14, 2026") for a hire that's ending when its paid month runs out. */
export function scheduledLastDayLabel(scheduledEndAt: string): string {
  // The end is 12:00 AM US Eastern on the day after the last day.
  const lastDay = new Date(new Date(scheduledEndAt).getTime() - 12 * 60 * 60 * 1000)
  return lastDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York',
  })
}
