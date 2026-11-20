# Supervision Payment Rules

The current rules for in-app supervision payments (hourly hires billed weekly
**after the work is logged** — post-pay — and Medical Director retainers billed
monthly — section 13), written from the code on `feat/supervision-payments`
(all three repos) as of **November 17, 2026**. When the code changes, update
this file in the same PR.

**Post-pay (CEO decision 2026-11-16).** The weekly prepay is gone. The
supervisor logs sessions Monday–Friday; at the Friday 11:59 PM cutoff the
supervisee's card is charged for the hours actually logged; the supervisee
reviews Saturday–Monday; the supervisor is **paid every Tuesday for the
previous week**. This ships before go-live, so no prepaid weeks exist to
convert. Follow-up answers (2026-11-17): the service fee stays
**non-refundable**; a failed charge tries the **backup card** right away and
runs **3 rounds through Sunday**, after which the supervisee's **account goes
on hold** until the week is paid; the weekly max and total hours are
**flags, not limits** (over-cap sessions are charged unless disputed).

All times are **US Eastern** (`America/New_York`). All money is **USD**.

---

## 1. Which hires are billed in the app

| Rule                       | Detail                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature flags              | Backend `SUPERVISION_IN_APP_PAYMENTS_ENABLED=true` and frontend `NEXT_PUBLIC_IN_APP_PAYMENTS_ENABLED=true`. Keep them in sync; the frontend flag only hides UI.                                                                                                                                                                                                                                                                 |
| Hourly = billed in the app | A hire is billed in the app when the flag is on **and** the supervisor's fee type is not `MONTHLY`. It applies to every supervisor (there is no pilot allowlist).                                                                                                                                                                                                                                                               |
| Who decides                | The supervisor's **current** fee type when the agreement is sent, not the snapshot on the hire request. Once signed, the agreement's own terms decide.                                                                                                                                                                                                                                                                          |
| Monthly                    | Medical Directors are monthly only. Other supervisors can only keep Monthly if their profile was already Monthly (grandfathered). With monthly in-app billing **off**, monthly agreements are **paid outside the app** (no card, no payout account). With it **on**, new monthly agreements are billed in the app — see section 13.                                                                                             |
| Kill switch                | Turning the backend flag off stops new weeks, new charges (including the weekly invoice charge and its retries), session logging and late-entry requests. Weeks already in progress still move through review and settlement of money already collected, and both sides can still see them and the supervisee can still approve or dispute. A closed week whose invoice wasn't charged yet is charged when the flag comes back. |

## 2. What has to be in place first

| Who        | Requirement                                                                                                                                        | Enforced                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Supervisor | **Paid platform plan** (Platform Access) to accept requests, message supervisees, and see a pending supervisee's name.                             | Backend                                                 |
| Supervisor | **Payout account** (Stripe Connect Express, US) with payouts enabled before sending an hourly agreement.                                           | Backend (payouts enabled) and frontend (status "ready") |
| Supervisee | A **saved card** for the hire **before signing** the hourly agreement. The supervisor's payout account must be ready before the card can be saved. | Backend and frontend                                    |
| Supervisee | Any active plan (the free plan counts) to send a hire request.                                                                                     | Backend                                                 |

Not required: a paid plan for proposing an agreement, logging sessions,
receiving payouts, or ending a supervision.

## 3. Agreement terms (hourly)

| Term               | Rule                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hourly rate        | $1 – $10,000 (cents allowed).                                                                                                                                                                                                                           |
| Max hours per week | 1 – 40, whole hours. What the parties agreed to, **not a hard limit**: the supervisor can log more; the extra time is flagged on the week and in the review notice, and charged like the rest unless the supervisee reports a problem (CEO 2026-11-17). |
| Agreement length   | **Ongoing** (until either side ends it) or **until a set number of hours** (1 – 10,000). The total is a flag too: logging past it is allowed and flagged ("takes the agreement past its N hours"); the supervision is not ended automatically.          |
| Start date         | Can't be in the past (Eastern date). Monthly agreements may be backdated. Signing an hourly agreement (card already saved) makes the hire **In Progress** right away.                                                                                   |
| Platform fee       | Locked when the agreement is first proposed: `SUPERVISION_PLATFORM_FEE_BPS` (0 – 5000 basis points), default **1000 = 10%**. Edits keep the original fee.                                                                                               |
| Sending            | Only for an **Accepted** hire with no agreement yet.                                                                                                                                                                                                    |
| Editing            | Only before the supervisee signs. Each edit creates a new version that the supervisee signs.                                                                                                                                                            |
| Document           | Platform default template (with Governing Law and Venue in the supervisee's licensure state) or the supervisor's own upload. **Billing always uses the terms entered in the form**, not the uploaded document.                                          |

## 4. The money

| Amount                        | Formula                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Weekly maximum                | rate × max hours per week (a cap on logging; shown on the agreement as "up to $X/week")                                                          |
| Invoice (hours)               | rate × every logged minute at the Friday cutoff (time over the weekly max included, flagged to the supervisee)                                   |
| Service fee                   | Stripe card processing passed through: total = ⌈(hours + 30¢) ÷ (1 − 2.9%)⌉; fee = total − hours. $0 when nothing was logged.                    |
| Charged after the cutoff      | hours + service fee                                                                                                                              |
| Earned for the week           | rate × approved hours, never more than the hours charged                                                                                         |
| Platform fee                  | earned × fee % (rounded to the cent), kept from the supervisor's share                                                                           |
| Paid to the supervisor        | earned − platform fee, on Tuesday                                                                                                                |
| Back to the supervisee's card | Only when a dispute lowers the hours: hours charged − earned. **The service fee is not returned** (CEO 2026-11-17, "non-refundable like today"). |

**Example:** $100/hour, max 2 hours per week, 10% platform fee, 1.5 hours logged.

- Charged after Friday's cutoff: **$154.79** ($150.00 + $4.79 service fee)
- 1.5 hours approved: supervisor gets **$135.00** on Tuesday, platform keeps **$15.00**, nothing goes back
- Dispute resolved at 1 hour: supervisor gets **$90.00**, **$50.00** goes back to the card; the $4.79 fee stays
- Dispute resolved at 0 hours: **$150.00** goes back; the fee stays
- Nothing logged: **nothing is charged**, not even the fee ("Closed · nothing charged")
- 2.5 hours logged on a 2-hour max (not disputed): **$257.78** charged ($250.00 + $7.78), supervisor gets **$225.00**

**Service fee on refunds.** Not returned (Stripe keeps its processing fee on
refunded payments). `SUPERVISION_REFUND_SERVICE_FEE=true` would return the
fee difference as well (the whole fee at 0 hours); it is off by the CEO's
decision.

**First week.** When the start date falls after Monday, that week's maximum is
prorated by the **weekdays left** (max × weekdays left ÷ 5, rounded up to 15
minutes, at least 15 minutes): a Wednesday start gets 3/5. A start on Saturday,
Sunday or Monday has the whole working week ahead and isn't prorated. Every
later week uses the full weekly max. The service fee rate is configurable
(`SUPERVISION_CARD_FEE_PERCENT`, default 2.9; `SUPERVISION_CARD_FEE_FIXED_CENTS`,
default 30) for pricing other than Stripe's standard US card rate.

**Every charge is confirmed to the supervisee** (in-app notice and email
receipt) and announced to the supervisor ("you're paid Tuesday").

Money flow: the platform charges the supervisee, then transfers the
supervisor's share to their Stripe Connect account at settlement (separate
charges and transfers).

**Settlement order and failures.** At settlement any money owed back to the
supervisee (a dispute lowered the hours) is refunded **first**, then the
supervisor's share is transferred, so a missing or restricted payout account
never holds the refund. If the transfer can't be made (e.g. the supervisor
closed their Stripe account), the week stays Approved and is retried every 15
minutes; the first failure is recorded on the week (`settlementFailedAt` /
`settlementError`), Gotham support is emailed once, and the week shows under
**Needs attention** in the admin panel until it settles. A week closed at $0
whose charge did go through after all (e.g. Pay now confirmed in the browser as
support closed it at 0 hours) is settled as paid with everything refunded,
never left charged.

Database note: the `HirePayment` columns keep their historical names —
`prepayStatus` is the invoice's charge status, `prepayAmountCents` the hours
charged, `totalCents` what the card was charged.

## 5. The weekly cycle

Billing weeks run **Saturday 12:00 AM → Friday 11:59 PM** US Eastern. A session
held on Saturday or Sunday goes on the invoice of the Monday–Friday that
follows it (the CEO's choice: "Sat/Sun sessions go on the next week's
invoice"). `weekStart` in the database is the Saturday; `?week=` deep links use
that date.

| When                                      | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Agreement signed** (card already saved) | The hire becomes **In Progress** and the current week is opened, so logging can start right away. Nothing is charged.                                                                                                                                                                                                                                                                                                                                                                                        |
| **During the week**                       | The supervisor logs sessions: 15-minute units, 15 minutes to 8 hours each, notes required. Never for a future date, a date before the agreement started **or before the supervisee signed** (this also applies to late entries), never after the day the supervision ended, and never while the supervisee's account is on hold (section 6). Time over the weekly max or the total hours is allowed and flagged (`overCapMinutes`, review notice). Sessions can be edited or deleted while the week is open. |
| **Friday 11:59 PM**                       | Cutoff. The week closes with its invoice set from the logged hours. A week with nothing logged closes **settled at $0**: nothing is charged, no review.                                                                                                                                                                                                                                                                                                                                                      |
| **Right after the cutoff**                | Round 1: the supervisee's card is charged the invoice (hours + service fee), off-session; if it declines, the **backup card** (if any) is tried right away. Both sides are told (receipt to the supervisee).                                                                                                                                                                                                                                                                                                 |
| **Saturday → Monday 11:59 PM**            | Review. The supervisee **approves** or **reports a problem** (disputes). Approving early doesn't pay out early.                                                                                                                                                                                                                                                                                                                                                                                              |
| **Tuesday 12:00 AM**                      | Weeks not acted on are **approved automatically** (unless a late entry is still waiting for an answer). Approved weeks whose invoice was collected **settle**: the supervisor's share is transferred. "Paid every Tuesday for the previous week."                                                                                                                                                                                                                                                            |
| **Sunday 11:59 PM**                       | An invoice still unpaid after the three rounds puts the supervisee's **account on hold** (section 6).                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Unpaid at payout time**                 | An approved week whose charge still failed waits (retries, Pay now); the supervisor is paid once it's collected. See section 6.                                                                                                                                                                                                                                                                                                                                                                              |

The billing job runs every 15 minutes, so each step happens within 15 minutes
of the times above. It runs in a single process even when the server is
clustered. If the job was down past a week's review deadline, the week still
gets a full 3-day review window from when it comes back (it is not approved and
paid out on the spot). If it was down for a whole week, the missed week is
filled in on the next run (looking back up to 4 weeks, never before the
agreement start, the card being saved or the supervisee's signature): a week
whose cutoff has passed is created **closed at $0 with nothing charged**, so
the supervisor can still request late entries for it within the 14-day window.
Rows that already exist are never changed.

**After settlement.** A refund that fails on Stripe's side (closed card) and a
chargeback (`charge.dispute.created`) each email Gotham support with the week;
nothing is reversed automatically. (Both event types must be enabled on the
Stripe webhook endpoint.)

**Disputes.** A reason of 10 – 1000 characters and up to 3 images (JPG or PNG,
5 MB each). The week is frozen and Gotham support is emailed. Support decides
the approved hours (15-minute units, at most what was logged and the weekly
logged — the weekly max no longer caps it), then the week settles (on or after
its payout day): the supervisor is paid for the approved hours and the hours'
difference goes back to the supervisee's card (the fee stays). Approving 0
hours returns the hours charged; on a week whose charge had failed, 0 hours
closes it at $0 and cancels the charge.

## 6. Failed payments, backup card and account hold

- A declined charge after the cutoff makes the week **unpaid**. Both sides are notified once (in-app and email, if their settings allow).
- **Backup card (optional).** The supervisee can set a second saved card on the hire (`PUT /hires/:id/payment/backup-card`); they're prompted for it but never required to add one. Whenever the primary card declines, the backup is tried right away in the same round.
- **Three rounds.** Round 1 right after the cutoff, round 2 ~20 hours later (Saturday evening ET), round 3 ~20 hours after that (Sunday afternoon) — `CHARGE_MAX_ATTEMPTS` / `CHARGE_RETRY_HOURS` in `supervision_prepay_service.js`. Each round confirms the same PaymentIntent with the hire's **current** primary card, then the backup; a card changed after a decline is used by the next round. After the last failed round both sides are told again and Gotham support is emailed.
- **Account hold.** An invoice still unpaid at **Sunday 11:59 PM ET** puts the supervisee's account on hold (`SupervisionUser.billingHoldAt`, the week in `billingHoldWeekId`; applied by the billing job). While on hold: supervisors can't log new sessions on **any** of that supervisee's contracts (`canLog` false, logging returns 403), the supervisee can't send new hire requests or sign new agreements (403); messaging stays open; weeks already closed keep going through review and payout. The hold **lifts automatically the moment the unpaid week is paid** (Pay now, a later retry, or support closing it at 0 hours). The supervisee and every supervisor with an active contract with them are told when the hold starts and when it lifts (in-app `BILLING_HOLD_STARTED` / `BILLING_HOLD_LIFTED` + email). One hold per supervisee at a time, named after the oldest unpaid week.
- The supervisee can pay with **Pay now** at any time once the week is closed (in the browser, so 3-D Secure works). Pay now uses the hire's current primary card. It is refused while the week is still open (nothing to pay yet).
- **Changing the card** doesn't charge the unpaid week; it clears the old decline message. The next round or Pay now uses the new card. A card that is a hire's backup can be removed from the saved cards at any time (it just stops being the backup).
- The week still goes through review; the supervisor is paid only after it's collected.
- A card can't be removed while it pays for an active supervision, nor while an ended supervision still owes for a week the supervisor logged hours into (closed and unpaid, or still open and due to be charged at its cutoff).
- The supervisee can't cancel or mark completed a supervision while a **closed** week with logged hours is unpaid: that week is paid (or disputed and resolved by support) first. The week still open is no obstacle — it's charged at its cutoff as usual, even after the supervision ended.
- Admins see unpaid weeks, and weeks whose supervisee is on hold, under **Needs attention** (with the round count).

## 7. Late entries

- If the supervisor missed logging a session, they can **request a late entry** within **14 days** after that week ends. Support is emailed.
- **Gotham support** adds it (or dismisses the request, with a note). The supervisee **approves or rejects** it.
- If that week was already settled, an approved late session is **charged on its own**: hours × rate plus its own service fee. The supervisor's share is transferred right away. On a week still waiting for its payout it joins the approved hours, paid out only up to what the week's invoice charged.
- A failed late charge is retried only by support (a card decline and any other error — e.g. a removed card — both leave it "failed" with the reason, so **Retry charge** works). A late entry the supervisee hasn't answered within **3 days** is approved automatically (like an unreviewed week), so it can't hold up the week.
- If the charge succeeds but the supervisor's payout can't be made (no payout account), the entry is marked "Payout pending", support is emailed once, and the billing job retries the transfer every 15 minutes.

## 8. When the total hours are used up

- Nothing is blocked (CEO 2026-11-17). Weeks keep being created and sessions past the total are logged; the review notice tells the supervisee the week "takes the agreement past its N hours" so they can report a problem. The total counts approved hours for weeks already approved or settled (a dispute can cut them), logged hours for weeks still open, and late sessions charged on their own.
- The supervision is **not** ended automatically; either side ends it.

## 9. Ending a supervision

| Who        | Action                                                      | Result                |
| ---------- | ----------------------------------------------------------- | --------------------- |
| Supervisor | End Supervision (completed or ended early, optional reason) | Completed or Canceled |
| Supervisee | Mark as Completed                                           | Completed             |
| Supervisee | Cancel Request                                              | Canceled              |

After a supervision ends: no new weeks are billed. The week that was open can
still be logged until its cutoff — only for sessions held up to the day the
supervision ended — and is then charged, reviewed and settled as usual. A week
with nothing logged costs nothing. There are no other refunds.

## 10. Supervisor payouts

- Settlement transfers the supervisor's share to their Stripe Connect account; Stripe deposits it to their bank on the account's payout schedule (the Stripe default, usually within 2 business days).
- Supervisors are notified when a week is paid, and when a bank payout arrives or fails.
- The payout account can't be removed while there are active hourly supervisions, charged weeks not yet settled, or a Stripe balance.
- US bank accounts only.

## 11. Reminders

| When                       | Who        | What                                                                                                                                                                |
| -------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Friday from 9 AM           | Supervisor | Cutoff tonight: log this week's sessions (skipped if the week is already full, or supervision hasn't started yet)                                                   |
| When a week goes to review | Supervisee | The invoice being charged (with any time over the weekly max / total hours flagged); approve or report a problem by Monday 11:59 PM; the supervisor is paid Tuesday |
| Daily 9:00 AM              | Supervisee | Sign the agreement (every 2 days while unsigned)                                                                                                                    |
| Daily 9:15 AM              | Supervisor | Send the agreement (2 days after accepting, then every 7 days)                                                                                                      |

Failed charges, the last failed round, and the account hold starting and lifting each notify both sides (in-app + email, section 6).

The manual "Remind to sign" button works once per 24 hours. Every reminder
respects the user's notification and email settings; a user who has never
opened Settings (no settings row yet) counts as opted in, for every
notification and email alike. Review, Pay now and payment notifications link
to the week in question (`?tab=timesheet&week=YYYY-MM-DD`).

## 12. Platform plan (subscription)

- Paid plans activate when Stripe confirms the invoice (`invoice.paid` webhook). The checkout success page also syncs the plan from Stripe directly, so it shows as active right away even if the webhook is late.
- When a paid plan becomes active, the free plan is retired; when it's canceled, the free plan comes back.

---

## 13. Monthly billing (Medical Director retainers)

Behind its own flags: backend `SUPERVISION_IN_APP_MONTHLY_ENABLED=true` and
frontend `NEXT_PUBLIC_IN_APP_MONTHLY_ENABLED=true` (both also need the in-app
payments flag). Kept apart from hourly billing: its own table
(`HireMonthlyPeriod`), service, cron and Stripe metadata kind (`hire_monthly`).
With the backend flag off, no cards are saved and nothing new is charged (Pay
now included); months already paid still run through their window and release,
and both sides can still see them, report a problem and release early. Bounced
refunds and chargebacks on a month email support (see hourly §5).

| Rule                   | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Which agreements       | New agreements of a supervisor whose fee type is Monthly, while the flag is on. Agreements made before (or with the flag off) stay paid outside the app — they have no platform fee stored.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Terms                  | Monthly amount $1 – $100,000. Length: **month to month** (until ended) or **1 – 60 months**. Start date can't be in the past. Platform fee locked at proposal (`SUPERVISION_PLATFORM_FEE_BPS`, default 10%).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Before signing         | Supervisor: payout account with payouts enabled. Supervisee: a saved card.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Months                 | On the start date's anniversary, US Eastern (Nov 15 → Dec 15 → Jan 15). Counted from the original start date, so a 31st start runs Feb 28 (29), Mar 31, Apr 30. Not prorated. A signature after the start date charges the month that's running, not months already gone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Charge                 | At the start of each month: amount + service fee (⌈(amount + 30¢) ÷ (1 − 2.9%)⌉ − amount, **never refunded**). $1,000 → **$1,030.18**. The first successful charge moves the hire to **In Progress**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Escrow                 | The platform holds the money. After the month ends, a **3-day window** to report a problem, then it's released: supervisor gets amount − 10% ($1,000 → **$900**). The supervisee can release early (Release now).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Problem reports        | While the month runs or in its 3-day window, reason 10 – 1,000 characters. The money is frozen; support (admin → Monthly Payments) decides how much to release; the rest of the amount is refunded. Both sides are told the outcome (in-app and email). At settlement the client's part is refunded **first**, then the Medical Director's share is transferred; if the transfer can't be made (payout account gone) the month stays Released, support is emailed once, the failure shows on the month in the admin panel, and it's retried every 15 minutes.                                                                                                                                                                                                                                                                                                                                                                  |
| Ending (either side)   | With a paid month running: the hire **stays active until that month ends**, no refund, no more charges, then becomes Completed / Canceled. Before any paid month (or while unpaid): ends now, an unpaid month is canceled. If a canceled month's charge turns out to have gone through (Pay now confirmed as the hire ended), it's refunded in full (service fee kept).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Fixed number of months | Scheduled to complete when the last month ends; both sides get a reminder 14 days before. Either side can still end it early. A term that was never paid for lapses as Canceled, not Completed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Failed charge          | Not retried automatically. Supervisee: Pay now (3-D Secure in the browser). **7-day grace**; reminder 2 days before it ends. After 7 days unpaid the supervisor can end the supervision (immediately; the unpaid month is canceled and not paid out). The supervisor can't end over a month that hasn't been charged yet. No new month is charged while one is unpaid **or under a reported problem**; a month paid late still gets its 3-day window. A month skipped meanwhile (supervision continued) is a **catch-up**: the supervisee is told (in-app + email) and it's charged the next day — one skipped month per day, each with its own notice; ending the supervision stops it. A card that's gone at charge time (removed outside the app) counts as a failed payment too, with the same grace and notices. A Pay now left unfinished in the browser is cleared after 10 minutes so the automatic charge still runs. |
| Reminders              | Renewal notice to the supervisee 3 days before each next charge (in-app + email); grace reminders above; "ends on …" to both sides 14 days before a fixed term ends (in-app + email). Medical Director: "nothing logged this month" two weeks into a paid month and again 3 days before it ends, only while the activity log for that month is empty (in-app + email, links to the log).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Activity log           | Medical Director hires only (in-app or offline): meetings, chart reviews, protocol sign-offs, logged for this month and last; a month's entries lock once it's released or reported, entries added after a report are marked. Each entry can carry up to **5 files** (JPG, PNG, PDF, 10 MB each; private, 24-hour links) — a signed protocol, an agenda. Files follow the entry's lock, are uploaded before the entry is saved (a failed upload saves nothing) and are deleted with it. Support sees them on a disputed month; PDF/CSV export lists them by name.                                                                                                                                                                                                                                                                                                                                                              |
| Payout account / cards | The supervisor can't remove the payout account with active monthly hires or paid months not yet released. A card paying for an active monthly hire can't be removed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Dev/QA: `node scripts/supervision_monthly_billing.js tick | list <hireId> | shift <hireId> [days] | end-review <periodId> | end-grace <periodId>`.
Tests: `node tests/supervision_monthly_billing.test.js` (monthly) and
`node tests/supervision_hourly_billing_regression.test.js` (hourly + offline
monthly must stay unchanged). Deploy: `node scripts/apply_supervision_monthly_billing_release.js`, then `npx prisma generate`.
**Deploy, one command (run by hand, not wired into npm scripts):**
`node scripts/apply_supervision_release.js && npx prisma generate` in the
backend (runs all nine `scripts/apply_supervision_*_release.js` in order;
every step is idempotent). Where schema is deployed
with `prisma db push`, the push creates the tables/columns; the command is still
needed once for the data step in `hire_conversations` (attaches existing
conversations to their hires) and is harmless otherwise.
Post-pay: `node tests/supervision_hourly_billing_regression.test.js` (cutoff → invoice → 3 rounds → account hold → Pay now lifts it → Tuesday payout) and `node tests/supervision_settlement_hardening.test.js` (dispute refunds the hours first, over-cap sessions flagged and charged, $0 weeks, kill switch, ended hires still charged, retry with a changed card, backup card). Deploy adds `scripts/apply_supervision_postpay_release.js` (`HirePayment.chargeAttempts/lastChargeAttemptAt`, `Hire.stripeBackupPaymentMethodId`, `SupervisionUser.billingHoldAt/billingHoldWeekId`) as the ninth step of the release runner.
Missed weeks + signature bound: `node tests/supervision_week_backfill.test.js`. Deep links:
`node tests/supervision_deep_links.test.js` — Medical Director notifications and
emails open the MD workroom (`/medical-director-clients/<hireId>?tab=billing|activity`),
the supervisee's open their workroom; billing links carry `&period=<id>` so the
page scrolls to that month (the older `/medical-director-clients?billing=<id>` list
links keep working). Upload errors: `node tests/supervision_upload_errors.test.js`.
Activity log: `node tests/supervision_activity_log.test.js` and
`node tests/supervision_activity_log_attachments.test.js`; deploy
`node scripts/apply_supervision_activity_log_release.js` and
`node scripts/apply_supervision_activity_attachments_release.js`, then `npx prisma generate`.

## Known gaps (to decide)

1. ~~First week isn't prorated~~ — prorated since 2026-11-16 (section 4).
2. ~~Unanswered late entries never expire~~ — auto-approved after 3 days since 2026-11-16 (section 7).
3. ~~Weeks that are never paid stay unpaid indefinitely~~ — since 2026-11-17 the supervisee's account goes on hold until the week is paid (section 6); the week itself still has no automatic end.
4. ~~Total hours count logged hours~~ — approved hours for approved/settled weeks since 2026-11-16 (section 8).
5. **Payout readiness differs**: the frontend requires the Stripe account to be fully ready (transfers active), the backend only checks that payouts are enabled.
6. ~~After a supervision ends, an unpaid week can still be logged~~ — by design since post-pay: the open week is logged (up to the end day) and charged at its cutoff (section 9).
7. **Service fee rate** is Stripe's standard US card pricing by default; configurable per deployment since 2026-11-16, but still one estimate for all cards, and each late-entry charge carries its own fixed part.
8. **Wording to fix:** the backend error "Set up payouts in Billing & Invoices" (now "Payment Information" on the Billing page); the FAQ line "Saving or changing a card doesn't charge anything" (saving can charge a week that's already due); the "We've reminded them" note when a supervisee has no card (no such reminder exists); the pilot-allowlist comment in the backend `.env.example`.

## Where it lives in the code

| Area                                                            | Files                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Money math                                                      | `backend_job_finder/utils/supervision_billing.js`, `utils/supervision_billing_weeks.js`                                                                                                                                                                                  |
| Weeks, logging, review, reminders                               | `backend_job_finder/services/supervision_billing_week_service.js`, `services/supervision_billing_week_cron_service.js`                                                                                                                                                   |
| Charging (invoice + retries), Pay now, settlement, late charges | `backend_job_finder/services/supervision_prepay_service.js` (historical name; it is the invoice/charge service)                                                                                                                                                          |
| Cards, agreement terms, eligibility                             | `backend_job_finder/services/supervision_hire_billing_service.js`                                                                                                                                                                                                        |
| Payout accounts                                                 | `backend_job_finder/services/supervision_connect_service.js`                                                                                                                                                                                                             |
| Admin (disputes, late entries)                                  | `backend_job_finder/services/supervision_admin_payments_service.js`                                                                                                                                                                                                      |
| Monthly billing (section 13)                                    | `backend_job_finder/services/supervision_monthly_billing_service.js`, `services/supervision_monthly_billing_cron_service.js`, `utils/supervision_monthly_billing.js`; frontend `src/components/MonthlyBilling/`; admin `src/components/page/SupervisionMonthlyPayments/` |
| Limits                                                          | `backend_job_finder/validators/supervision_validator.js`                                                                                                                                                                                                                 |
| Frontend                                                        | `src/components/Supervisees/SendAgreementModal.tsx`, `src/components/HirePayment/`, `src/components/HireSessions/`, `src/components/HireWorkroom/`, `src/components/Billing/`, `src/components/Faq/index.tsx`                                                            |
