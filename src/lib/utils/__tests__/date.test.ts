import { describe, expect, it } from 'vitest'

import { todayLocalISO, toLocalISODate } from '@/lib/utils/date'

describe('toLocalISODate', () => {
  it('formats using the local calendar date with zero-padding', () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toLocalISODate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('uses local time, not UTC (regression: UTC-midnight parsing rejected "today")', () => {
    // 11pm local on Jan 5 — toISOString() would report Jan 6 in timezones behind UTC
    const lateEvening = new Date(2026, 0, 5, 23, 0, 0)
    expect(toLocalISODate(lateEvening)).toBe('2026-01-05')
  })
})

describe('todayLocalISO', () => {
  it("matches today's local date parts", () => {
    const now = new Date()
    expect(todayLocalISO()).toBe(toLocalISODate(now))
  })
})
