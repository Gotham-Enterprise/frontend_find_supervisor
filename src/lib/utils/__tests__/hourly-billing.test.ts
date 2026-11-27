import { describe, expect, it } from 'vitest'

import {
  chargeFailureText,
  chargeRoundText,
  MAX_CHARGE_ROUNDS,
  overCapMinutesOf,
  overCapText,
  overTotalText,
  superviseeHoldText,
  supervisorHoldText,
} from '../hourly-billing'

describe('chargeFailureText', () => {
  it('counts the round and promises another try while rounds remain', () => {
    expect(chargeFailureText(1)).toBe(
      "Payment failed (round 1 of 3) — we'll try your card(s) again; or tap Pay now.",
    )
    expect(chargeFailureText(2)).toContain('round 2 of 3')
  })

  it('leaves only Pay now after the last round and warns about the hold', () => {
    expect(chargeFailureText(MAX_CHARGE_ROUNDS)).toBe(
      "Payment failed after 3 rounds — tap Pay now with your current card. Your account goes on hold if it's still unpaid Sunday night.",
    )
    expect(chargeFailureText(7)).toContain('after 3 rounds')
  })

  it('never shows round 0', () => {
    expect(chargeFailureText(0)).toContain('round 1 of 3')
  })

  it('never says "attempt"', () => {
    for (const n of [0, 1, 2, 3, 4]) expect(chargeFailureText(n)).not.toMatch(/attempt/i)
  })
})

describe('chargeRoundText', () => {
  it('gives the short round label for list rows', () => {
    expect(chargeRoundText(0)).toBe('round 1 of 3')
    expect(chargeRoundText(2)).toBe('round 2 of 3')
    expect(chargeRoundText(3)).toBe('after 3 rounds')
    expect(chargeRoundText(9)).toBe('after 3 rounds')
  })
})

describe('over-cap helpers', () => {
  it('derives the minutes over the weekly max, never negative', () => {
    expect(overCapMinutesOf(300, 240)).toBe(60)
    expect(overCapMinutesOf(240, 240)).toBe(0)
    expect(overCapMinutesOf(60, 240)).toBe(0)
  })

  it('formats the flag text', () => {
    expect(overCapText(90)).toBe('1 h 30 min over weekly max')
    expect(overCapText(15)).toBe('15 min over weekly max')
    expect(overTotalText(60 * 42, 60 * 40)).toBe('2 h over the agreement')
  })
})

describe('hold texts', () => {
  it('names the unpaid week when known and stays generic otherwise', () => {
    expect(superviseeHoldText('2026-11-07')).toBe(
      "Your account is on hold — the week of Sat, Nov 7 is unpaid. Your supervisors can't log sessions and you can't start new supervisions until it's paid. Messaging stays open.",
    )
    expect(superviseeHoldText(null)).toContain('a week is unpaid')
  })

  it("tells the supervisor why they can't log", () => {
    expect(supervisorHoldText('Jane Doe')).toBe(
      "Jane Doe's account is on hold until their unpaid week is paid. You can't log new sessions until then; messaging stays open.",
    )
  })
})
