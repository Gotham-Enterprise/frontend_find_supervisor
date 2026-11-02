# Supervision Payment Rules

The current rules for in-app supervision payments (hourly hires billed weekly,
and Medical Director retainers billed monthly — section 13), written from the code on `feat/supervisor-payouts` (frontend)
and `feat/supervision-payments-foundation` (backend) as of **November 2, 2026**.
When the code changes, update this file in the same PR.

All times are **US Eastern** (`America/New_York`). All money is **USD**.

---

## 1. Which hires are billed in the app

| Rule                       | Detail                                                                                                                                                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature flags              | Backend `SUPERVISION_IN_APP_PAYMENTS_ENABLED=true` and frontend `NEXT_PUBLIC_IN_APP_PAYMENTS_ENABLED=true`. Keep them in sync; the frontend flag only hides UI.                                                                                                                                                                     |
| Hourly = billed in the app | A hire is billed in the app when the flag is on **and** the supervisor's fee type is not `MONTHLY`. It applies to every supervisor (there is no pilot allowlist).                                                                                                                                                                   |
| Who decides                | The supervisor's **current** fee type when the agreement is sent, not the snapshot on the hire request. Once signed, the agreement's own terms decide.                                                                                                                                                                              |
| Monthly                    | Medical Directors are monthly only. Other supervisors can only keep Monthly if their profile was already Monthly (grandfathered). With monthly in-app billing **off**, monthly agreements are **paid outside the app** (no card, no payout account). With it **on**, new monthly agreements are billed in the app — see section 13. |
| Kill switch                | Turning the backend flag off stops new weeks and new charges. Weeks already in progress still move through review and settlement.                                                                                                                                                                                                   |

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

| Term               | Rule                                                                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hourly rate        | $1 – $10,000 (cents allowed).                                                                                                                                                                                  |
| Max hours per week | 1 – 40, whole hours. This is the weekly cap the supervisee prepays.                                                                                                                                            |
| Agreement length   | **Ongoing** (until either side ends it) or **until a set number of hours** (1 – 10,000).                                                                                                                       |
| Start date         | Can't be in the past (Eastern date). Monthly agreements may be backdated.                                                                                                                                      |
| Platform fee       | Locked when the agreement is first proposed: `SUPERVISION_PLATFORM_FEE_BPS` (0 – 5000 basis points), default **1000 = 10%**. Edits keep the original fee.                                                      |
| Sending            | Only for an **Accepted** hire with no agreement yet.                                                                                                                                                           |
| Editing            | Only before the supervisee signs. Each edit creates a new version that the supervisee signs.                                                                                                                   |
| Document           | Platform default template (with Governing Law and Venue in the supervisee's licensure state) or the supervisor's own upload. **Billing always uses the terms entered in the form**, not the uploaded document. |

## 4. The money

| Amount                           | Formula                                                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Weekly prepay                    | rate × weekly cap                                                                                                       |
| Service fee                      | Stripe card processing passed through: total = ⌈(prepay + 30¢) ÷ (1 − 2.9%)⌉; fee = total − prepay. **Never refunded.** |
| Charged at the start of the week | prepay + service fee                                                                                                    |
| Earned for the week              | rate × approved hours, never more than the prepay                                                                       |
| Platform fee                     | earned × fee % (rounded to the cent), kept from the supervisor's share                                                  |
| Paid to the supervisor           | earned − platform fee                                                                                                   |
| Back to the supervisee's card    | prepay − earned                                                                                                         |

**Example:** $100/hour, max 2 hours per week, 10% platform fee.

- Charged at the start of the week: **$206.29** ($200.00 + $6.29 service fee)
- 1.5 hours approved: earned $150.00 → supervisor gets **$135.00**, platform keeps **$15.00**, **$50.00** goes back to the card
- 0 hours logged: **$200.00** goes back to the card; the $6.29 service fee is kept

The first week is **not prorated**: it charges the full weekly max even if the
start date is late in the week (the unused part goes back after review).

Money flow: the platform charges the supervisee, then transfers the
supervisor's share to their Stripe Connect account at settlement (separate
charges and transfers).

## 5. The weekly cycle

| When                                              | What happens                                                                                                                                                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monday 12:00 AM** (or the start date, if later) | The week's prepay is charged to the saved card. It's also charged right away when the agreement is signed or a card is saved, if a charge is already due. The first successful charge moves the hire from Accepted to **In Progress**.   |
| **During the week**                               | The supervisor logs sessions: 15-minute units, 15 minutes to 8 hours each, notes required. A session can't take the week over its weekly max or the hire over its total hours. Sessions can be edited or deleted while the week is open. |
| **Following Monday 11:59 PM**                     | Logging deadline. The supervisor can log the current week and last week until then.                                                                                                                                                      |
| **Tuesday 12:00 AM**                              | The week goes to review. A week with nothing logged is closed at $0 automatically.                                                                                                                                                       |
| **Until Thursday 11:59 PM**                       | The supervisee **approves** or **disputes**.                                                                                                                                                                                             |
| **Friday 12:00 AM**                               | Weeks not acted on are **approved automatically** (unless a late entry is still waiting for an answer).                                                                                                                                  |
| **On approval**                                   | The week **settles**: the supervisor's share is transferred and the unused prepay goes back to the card.                                                                                                                                 |

The billing job runs every 15 minutes, so each step happens within 15 minutes
of the times above.

**Disputes.** A reason of 10 – 1000 characters and up to 3 images (JPG or PNG,
5 MB each). The week is frozen and Gotham support is emailed. Support decides
the approved hours (15-minute units, at most what was logged and the weekly
max), then the week settles. Approving 0 hours returns the full prepay.

## 6. Failed payments

- A declined charge makes the week **unpaid**. It is **not retried automatically**.
- Both sides are notified once (in-app and email, if their settings allow).
- The supervisee pays with **Pay now** (in the browser, so 3-D Secure works). Pay now uses the hire's current card.
- **Changing the card** doesn't charge the unpaid week; it clears the old decline message, and the week still needs Pay now.
- The supervisor can keep logging sessions while the week is unpaid. The week still goes through review, but the supervisor is paid only after it's paid.
- A card can't be removed while it pays for an active supervision.
- A week that's never paid stays unpaid (shown to admins as needing attention). Later weeks keep billing.

## 7. Late entries

- If the supervisor missed logging a session, they can **request a late entry** within **14 days** after that week ends. Support is emailed.
- **Gotham support** adds it (or dismisses the request, with a note). The supervisee **approves or rejects** it.
- If that week was already settled, an approved late session is **charged on its own**: hours × rate plus its own service fee. The supervisor's share is transferred right away.
- A failed late charge is retried only by support. Late entries waiting for an answer don't expire.

## 8. When the total hours are used up

- No new weeks are billed, and sessions over the total are rejected. Logged hours count toward the total, not only approved hours.
- The supervision is **not** ended automatically; either side ends it.

## 9. Ending a supervision

| Who        | Action                                                      | Result                |
| ---------- | ----------------------------------------------------------- | --------------------- |
| Supervisor | End Supervision (completed or ended early, optional reason) | Completed or Canceled |
| Supervisee | Mark as Completed                                           | Completed             |
| Supervisee | Cancel Request                                              | Canceled              |

After a supervision ends: no new weeks are billed, an uncharged week is
canceled, and a week that was already paid can still be logged until its
deadline, then reviewed and settled as usual. There are no other refunds.

## 10. Supervisor payouts

- Settlement transfers the supervisor's share to their Stripe Connect account; Stripe deposits it to their bank on the account's payout schedule (the Stripe default, usually within 2 business days).
- Supervisors are notified when a week is paid, and when a bank payout arrives or fails.
- The payout account can't be removed while there are active hourly supervisions, paid weeks not yet settled, or a Stripe balance.
- US bank accounts only.

## 11. Reminders

| When                       | Who        | What                                                           |
| -------------------------- | ---------- | -------------------------------------------------------------- |
| Friday from 9 AM           | Supervisor | Log this week's sessions (skipped if the week is already full) |
| Monday from 9 AM           | Supervisor | Logging deadline tonight (only if nothing was logged)          |
| When a week goes to review | Supervisee | Approve or dispute by Thursday 11:59 PM                        |
| Daily 9:00 AM              | Supervisee | Sign the agreement (every 2 days while unsigned)               |
| Daily 9:15 AM              | Supervisor | Send the agreement (2 days after accepting, then every 7 days) |

The manual "Remind to sign" button works once per 24 hours. Every reminder
respects the user's notification and email settings.

## 12. Platform plan (subscription)

- Paid plans activate when Stripe confirms the invoice (`invoice.paid` webhook). The checkout success page also syncs the plan from Stripe directly, so it shows as active right away even if the webhook is late.
- When a paid plan becomes active, the free plan is retired; when it's canceled, the free plan comes back.

---

## 13. Monthly billing (Medical Director retainers)

Behind its own flags: backend `SUPERVISION_IN_APP_MONTHLY_ENABLED=true` and
frontend `NEXT_PUBLIC_IN_APP_MONTHLY_ENABLED=true` (both also need the in-app
payments flag). Kept apart from hourly billing: its own table
(`HireMonthlyPeriod`), service, cron and Stripe metadata kind (`hire_monthly`).

| Rule                   | Detail                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which agreements       | New agreements of a supervisor whose fee type is Monthly, while the flag is on. Agreements made before (or with the flag off) stay paid outside the app — they have no platform fee stored.                                                                                                                                                       |
| Terms                  | Monthly amount $1 – $100,000. Length: **month to month** (until ended) or **1 – 60 months**. Start date can't be in the past. Platform fee locked at proposal (`SUPERVISION_PLATFORM_FEE_BPS`, default 10%).                                                                                                                                      |
| Before signing         | Supervisor: payout account with payouts enabled. Supervisee: a saved card.                                                                                                                                                                                                                                                                        |
| Months                 | On the start date's anniversary, US Eastern (Nov 15 → Dec 15 → Jan 15). Counted from the original start date, so a 31st start runs Feb 28 (29), Mar 31, Apr 30. Not prorated. A signature after the start date charges the month that's running, not months already gone.                                                                         |
| Charge                 | At the start of each month: amount + service fee (⌈(amount + 30¢) ÷ (1 − 2.9%)⌉ − amount, **never refunded**). $1,000 → **$1,030.18**. The first successful charge moves the hire to **In Progress**.                                                                                                                                             |
| Escrow                 | The platform holds the money. After the month ends, a **3-day window** to report a problem, then it's released: supervisor gets amount − 10% ($1,000 → **$900**). The supervisee can release early (Release now).                                                                                                                                 |
| Problem reports        | While the month runs or in its 3-day window, reason 10 – 1,000 characters. The money is frozen; support (admin → Monthly Payments) decides how much to release; the rest of the amount is refunded.                                                                                                                                               |
| Ending (either side)   | With a paid month running: the hire **stays active until that month ends**, no refund, no more charges, then becomes Completed / Canceled. Before any paid month (or while unpaid): ends now, an unpaid month is canceled.                                                                                                                        |
| Fixed number of months | Scheduled to complete when the last month ends; both sides get a reminder 14 days before.                                                                                                                                                                                                                                                         |
| Failed charge          | Not retried automatically. Supervisee: Pay now (3-D Secure in the browser). **7-day grace**; reminder 2 days before it ends. After 7 days unpaid the supervisor can end the supervision (immediately; the unpaid month is canceled and not paid out). No new month is charged while one is unpaid; a month paid late still gets its 3-day window. |
| Reminders              | Renewal notice to the supervisee 3 days before each next charge; grace reminders above; "ends on …" before a fixed term ends.                                                                                                                                                                                                                     |
| Payout account / cards | The supervisor can't remove the payout account with active monthly hires or paid months not yet released. A card paying for an active monthly hire can't be removed.                                                                                                                                                                              |

Dev/QA: `node scripts/supervision_monthly_billing.js tick | list <hireId> | shift <hireId> [days] | end-review <periodId> | end-grace <periodId>`.
Tests: `node tests/supervision_monthly_billing.test.js` (monthly) and
`node tests/supervision_hourly_billing_regression.test.js` (hourly + offline
monthly must stay unchanged). Deploy: `node scripts/apply_supervision_monthly_billing_release.js`, then `npx prisma generate`.

## Known gaps (to decide)

1. **First week isn't prorated.** The service fee is sized on the full weekly max even if supervision starts late in the week.
2. **Unanswered late entries never expire**, and one waiting on a week in review blocks automatic approval.
3. **Weeks that are never paid stay unpaid indefinitely**; there is no escalation or automatic end.
4. **Total hours count logged hours**, including hours later reduced in a dispute, while the progress bar shows approved hours.
5. **Payout readiness differs**: the frontend requires the Stripe account to be fully ready (transfers active), the backend only checks that payouts are enabled.
6. **After a supervision ends**, an unpaid week can still be logged and paid (the code comment says only paid weeks should be).
7. **Service fee assumes US card pricing** (2.9% + 30¢); each late-entry charge adds another 30¢-based fee.
8. **Wording to fix:** the backend error "Set up payouts in Billing & Invoices" (now "Payment Information" on the Billing page); the FAQ line "Saving or changing a card doesn't charge anything" (saving can charge a week that's already due); the "We've reminded them" note when a supervisee has no card (no such reminder exists); the pilot-allowlist comment in the backend `.env.example`.

## Where it lives in the code

| Area                                        | Files                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Money math                                  | `backend_job_finder/utils/supervision_billing.js`, `utils/supervision_billing_weeks.js`                                                                                                                                                                                  |
| Weeks, logging, review, reminders           | `backend_job_finder/services/supervision_billing_week_service.js`, `services/supervision_billing_week_cron_service.js`                                                                                                                                                   |
| Charging, Pay now, settlement, late charges | `backend_job_finder/services/supervision_prepay_service.js`                                                                                                                                                                                                              |
| Cards, agreement terms, eligibility         | `backend_job_finder/services/supervision_hire_billing_service.js`                                                                                                                                                                                                        |
| Payout accounts                             | `backend_job_finder/services/supervision_connect_service.js`                                                                                                                                                                                                             |
| Admin (disputes, late entries)              | `backend_job_finder/services/supervision_admin_payments_service.js`                                                                                                                                                                                                      |
| Monthly billing (section 13)                | `backend_job_finder/services/supervision_monthly_billing_service.js`, `services/supervision_monthly_billing_cron_service.js`, `utils/supervision_monthly_billing.js`; frontend `src/components/MonthlyBilling/`; admin `src/components/page/SupervisionMonthlyPayments/` |
| Limits                                      | `backend_job_finder/validators/supervision_validator.js`                                                                                                                                                                                                                 |
| Frontend                                    | `src/components/Supervisees/SendAgreementModal.tsx`, `src/components/HirePayment/`, `src/components/HireSessions/`, `src/components/HireWorkroom/`, `src/components/Billing/`, `src/components/Faq/index.tsx`                                                            |
