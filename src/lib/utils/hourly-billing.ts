/**
 * Copy shared by the hourly (post-pay) billing surfaces. Weeks run Saturday to
 * Friday in US Eastern; the supervisee's card is charged for the logged hours
 * right after the Friday 11:59 PM ET cutoff and the supervisor is paid the
 * following Tuesday.
 */

import { formatCalendarDate, formatDuration } from './date'

/**
 * A failed weekly charge is retried in this many rounds: right after the Friday
 * cutoff, Saturday evening and Sunday afternoon (ET). Each round tries the
 * primary card and, if it declines, the backup card right away.
 */
export const MAX_CHARGE_ROUNDS = 3

/**
 * What a supervisee is told about a weekly charge that didn't go through:
 * "Payment failed (round 2 of 3) — we'll try your card(s) again; or tap Pay now."
 * After the last round only Pay now is left, and the account goes on hold if
 * the week is still unpaid Sunday night.
 */
export function chargeFailureText(chargeAttempts: number): string {
  const round = Math.min(Math.max(chargeAttempts, 1), MAX_CHARGE_ROUNDS)
  if (round >= MAX_CHARGE_ROUNDS) {
    return `Payment failed after ${MAX_CHARGE_ROUNDS} rounds — tap Pay now with your current card. Your account goes on hold if it's still unpaid Sunday night.`
  }
  return `Payment failed (round ${round} of ${MAX_CHARGE_ROUNDS}) — we'll try your card(s) again; or tap Pay now.`
}

/** Short form for list rows: "round 2 of 3" / "after 3 rounds". */
export function chargeRoundText(chargeAttempts: number): string {
  const round = Math.min(Math.max(chargeAttempts, 1), MAX_CHARGE_ROUNDS)
  return round >= MAX_CHARGE_ROUNDS
    ? `after ${MAX_CHARGE_ROUNDS} rounds`
    : `round ${round} of ${MAX_CHARGE_ROUNDS}`
}

/**
 * Minutes logged beyond the weekly max. The weekly max is soft: the backend
 * accepts sessions over it and reports `overCapMinutes` on each billing week;
 * surfaces that only have the logged minutes and the cap derive the same figure.
 */
export function overCapMinutesOf(loggedMinutes: number, weeklyCapMinutes: number): number {
  return Math.max(loggedMinutes - weeklyCapMinutes, 0)
}

/** "1 h 30 min over weekly max" — the flag shown next to a week's logged time. */
export function overCapText(overCapMinutes: number): string {
  return `${formatDuration(overCapMinutes)} over weekly max`
}

/** "2 h over the agreement" — when the agreement's total hours have been passed. */
export function overTotalText(loggedMinutes: number, totalMinutes: number): string {
  return `${formatDuration(loggedMinutes - totalMinutes)} over the agreement`
}

/** Hold placed on a supervisee's account by an unpaid week, as the API reports it. */
export interface BillingHold {
  superviseeOnHold: boolean
  holdSince: string | null
  holdWeekId: string | null
}

/**
 * The supervisee's own hold notice. `weekStartDate` is the unpaid week's
 * Saturday when the caller can see that week; otherwise the notice stays generic.
 */
export function superviseeHoldText(weekStartDate: string | null): string {
  const week = weekStartDate ? `the week of ${formatCalendarDate(weekStartDate)}` : 'a week'
  return `Your account is on hold — ${week} is unpaid. Your supervisors can't log sessions and you can't start new supervisions until it's paid. Messaging stays open.`
}

/** What the supervisor sees instead of the Log Session button while the supervisee is on hold. */
export function supervisorHoldText(superviseeName: string): string {
  return `${superviseeName}'s account is on hold until their unpaid week is paid. You can't log new sessions until then; messaging stays open.`
}
