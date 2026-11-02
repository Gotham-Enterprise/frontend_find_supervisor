import { describe, expect, it } from 'vitest'

import { isInAppMonthlyAgreement, scheduledLastDayLabel } from '@/lib/utils/monthly-billing'
import type { AgreementRecord } from '@/types/hire'

const agreement = (overrides: Partial<AgreementRecord>): AgreementRecord =>
  ({
    monthlyAmount: null,
    platformFeeBps: null,
    hourlyRateCents: null,
    weeklyCapMinutes: null,
    ...overrides,
  }) as AgreementRecord

describe('isInAppMonthlyAgreement', () => {
  it('is true for monthly terms with a platform fee', () => {
    expect(
      isInAppMonthlyAgreement(agreement({ monthlyAmount: '1000', platformFeeBps: 1000 })),
    ).toBe(true)
  })

  it('is false for monthly terms paid outside the app (no platform fee)', () => {
    expect(isInAppMonthlyAgreement(agreement({ monthlyAmount: '1000' }))).toBe(false)
  })

  it('is false for hourly agreements', () => {
    expect(
      isInAppMonthlyAgreement(
        agreement({ hourlyRateCents: 10000, weeklyCapMinutes: 120, platformFeeBps: 1000 }),
      ),
    ).toBe(false)
  })

  it('is false without an agreement', () => {
    expect(isInAppMonthlyAgreement(null)).toBe(false)
  })
})

describe('scheduledLastDayLabel', () => {
  it('shows the day before the 12:00 AM Eastern end', () => {
    // Dec 15, 2026 12:00 AM EST → last day Dec 14
    expect(scheduledLastDayLabel('2026-12-15T05:00:00.000Z')).toBe('Dec 14, 2026')
  })

  it('handles daylight saving time', () => {
    // Jul 1, 2026 12:00 AM EDT → last day Jun 30
    expect(scheduledLastDayLabel('2026-07-01T04:00:00.000Z')).toBe('Jun 30, 2026')
  })
})
