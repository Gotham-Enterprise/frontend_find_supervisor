# Supervision Payments — Go-Live Checklist (non-code)

Companion to `supervision-payment-rules.md`. These items are outside the
codebase: legal copy, Stripe account settings and decisions that need a person.
Drafts below are starting points for legal review, not final language.

## 1. Terms of Service — clauses to add

**Payments through the platform.** Supervision fees agreed between a Supervisor
(including Medical Directors) and a Supervisee may be paid through Find a
Supervisor. Hourly agreements are billed after the work: the Supervisor logs
sessions during the billing week (Saturday–Friday, US Eastern), the Supervisee's
card is charged for the logged hours after the Friday 11:59 PM cutoff, the
Supervisee reviews through Monday, and the Supervisor is paid on Tuesday. If a
problem report lowers the hours, the difference goes back to the card. Nothing
is charged for a week with no sessions. If a weekly charge can't be collected
after the Supervisee's cards have been tried through Sunday, the Supervisee's
account is placed on hold (no new sessions on their contracts, no new hire
requests or agreements) until the week is paid. Monthly agreements are charged on the start date and the same day
each month; the platform holds each payment and releases it to the Medical
Director three days after the month ends unless a problem is reported.

**Service fee.** Each charge includes a service fee that covers card processing.
It is not returned when a disputed amount goes back to the card.

**Platform fee.** Find a Supervisor keeps a platform fee (currently 10%) from
the amount earned by the Supervisor. The percentage is fixed when the agreement
is proposed and shown in the agreement terms.

**Disputes and reports.** A Supervisee may dispute a week's sessions, or report a
problem with a month, within the review window shown in the app. The money is
held while Gotham Enterprises support reviews it. Support may read the
conversation between the parties for that engagement, the Medical Director's
activity log and any evidence either side submits, and decides how much is
released. Its decision is final within the platform; it does not limit either
party's rights outside it.

**Unpaid amounts.** A Supervisee may not cancel or complete a supervision while
a week with logged hours is unpaid, and may not remove the card that pays for
it. Failed charges are not retried automatically; the Supervisee pays with
"Pay now". A Medical Director may end a monthly supervision after seven days
unpaid.

**Payouts.** Supervisors are paid through Stripe Connect to a US bank account on
Stripe's schedule. The Supervisor is responsible for keeping the payout account
active; payouts wait while it is missing or restricted.

**Chargebacks.** If a Supervisee disputes a charge with their bank after the
Supervisor was paid, Gotham Enterprises may recover the amount from the
Supervisor's future payouts.

## 2. Privacy Policy — additions

- Card details are collected and stored by Stripe, not by Find a Supervisor; we
  store only a card's brand, last four digits and expiry for display.
- Supervisor identity and bank details for payouts are collected by Stripe
  Connect under Stripe's own terms.
- When a week or month is disputed, support staff may read the messages between
  the two parties for that engagement, the activity log and submitted evidence,
  and this access is recorded.
- Payment records (amounts, dates, outcomes) are kept for the engagement's life
  and as required for accounting.

## 3. Legal questions to settle

- **Platform fee on physician services.** Confirm that taking a percentage of a
  Medical Director's retainer is permitted in the states served (fee-splitting
  and corporate-practice-of-medicine rules differ by state; a flat platform fee
  may be safer in some). The fee is configurable per deployment
  (`SUPERVISION_PLATFORM_FEE_BPS`), so a different structure needs only a
  product decision plus a copy change.
- **Escrow / money transmission.** The platform holds monthly payments for up to
  ~34 days before release. Confirm with counsel that Stripe's separate charges
  and transfers model covers this without a money-transmitter licence.
- **Dispute decisions.** Confirm the wording that support's decision is final
  within the platform.

## 4. Stripe account (live mode)

- Public business name shown on statements and receipts: **Find a Supervisor**
  (not a personal name). Statement descriptor ≤ 22 characters.
- Support email and phone: a shared support address, not a personal mailbox.
- Branding (logo, colour) for Checkout, receipts and the Connect Express
  dashboard.
- Webhook endpoints (live): `/webhook/v1/supervision/stripe` with
  `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `payment_intent.succeeded`,
  `payment_intent.payment_failed`, `payment_intent.requires_action`,
  `payment_intent.canceled`, **`refund.failed`**, **`charge.dispute.created`**;
  and `/webhook/v1/supervision/stripe-connect` (Connected accounts) with
  `account.updated`, `account.application.deauthorized`, `payout.paid`,
  `payout.failed`.
- Connect: Express accounts, US only, `transfers` capability; platform pays
  Stripe fees on transfers.
- Radar rules reviewed for recurring off-session charges.
- **Live API key must not be "Limited access"** (seen on all three live
  secret keys on 2026-11-16). Stripe limits a key that hasn't created
  transfers or payouts in 180 days: such a key **cannot create transfers**,
  which is how supervisors and Medical Directors are paid at settlement.
  Refunds and charges are unaffected. With a limited key, every settlement
  refunds the supervisee first, then fails at the transfer, is recorded as
  "Settlement failing" (admin Needs attention) and emails support once; no
  money is lost, but nobody is paid until the key is fixed. Fix: Dashboard →
  Developers → API keys → ⋯ on the production key → **Restore access**.
  Once live, weekly transfers keep the key active. Better: a restricted key
  (`rk_live_`) with only Customers, PaymentMethods, SetupIntents,
  PaymentIntents, Refunds, Transfers, Connect accounts/account links,
  Balance transactions (read) and Events (read); and an **access policy**
  (server IPs) on it — all live keys currently have none.
- First live run: one $1 hourly week end to end (log → Friday cutoff charge →
  review → Tuesday transfer to a real Express account, plus one disputed week
  with a partial refund) before announcing.

## 4b. Database release (backend)

- `node scripts/apply_supervision_release.js && npx prisma generate` runs all
  supervision release scripts in order (manual trigger, on purpose not an npm
  script). Idempotent; in production it requires `CONFIRM_RELEASE=yes`. If the deploy already ran `prisma db push`, run it
  anyway: `hire_conversations` has a data step (attach existing conversations
  to hires, open a room for hires without one) that `db push` cannot do.
- Never `prisma db push` from a branch against a database that has columns
  the branch schema lacks (it drops them).

## 5. Operations

- `SUPPORT_EMAIL` (or the configured support address) is a monitored shared
  inbox: settlement failures, bounced refunds, chargebacks and late-entry
  requests go there.
- Admin panel → Supervision → Payments: check **Needs attention** daily.
- Run the billing crons in one process (`DISABLE_CLUSTERING=true`, or rely on
  the single-worker guard in `server.js`).
- Deploy order for the database scripts is in `supervision-payment-rules.md`
  (section "Where it lives"), ending with
  `apply_supervision_settlement_hardening_release.js`.

## 6. Deployment runbook (production)

Order: Stripe live prerequisites (§4) → backend with the three flags **off** →
admin → frontend with its three `NEXT_PUBLIC_*` flags **off** → database
release command → verify → flags on (backend first, then frontend).

1. **Backend env:** `STRIPE_SECRET_KEY` (live key that is _not_ "Limited
   access", or a restricted key with the agreed permissions),
   `STRIPE_SUPERVISION_WEBHOOK_SECRET`, `STRIPE_SUPERVISION_CONNECT_WEBHOOK_SECRET`,
   `SUPERVISION_IN_APP_PAYMENTS_ENABLED`, `SUPERVISION_IN_APP_MONTHLY_ENABLED`,
   `SUPERVISION_ACTIVITY_LOG_ENABLED` (all `false` at first),
   `SUPERVISION_PLATFORM_FEE_BPS=1000`, `SUPERVISION_SUPPORT_EMAIL`,
   `ADMIN_FRONTEND_URL`, `CLIENT_URL_PROD_SUPERVISION`, `AWS_BUCKET_NAME`.
2. **Deploy backend.** If the pipeline runs `prisma db push`, it creates the
   tables and columns. Then, once, on the host:
   `CONFIRM_RELEASE=yes node scripts/apply_supervision_release.js && npx prisma generate`
   (idempotent; still required for the `hire_conversations` data step). Restart.
   Crons start only in cluster worker 1 / `NODE_APP_INSTANCE=0`.
3. **Platform Access plan (live):** set `STRIPE_SUPERVISION_PLATFORM_PRICE_ID` /
   `_PRODUCT_ID` to the live price/product, run `node prisma/seedSupervisionPlanProd.js` once.
4. **Deploy admin**, then **frontend** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…`,
   the three `NEXT_PUBLIC_*` flags `false`).
5. **Turn on and verify:** backend flags → true, restart; frontend flags →
   true, redeploy. Dashboard test event to both webhook endpoints → 200. A $1
   live hourly week end to end (log → cutoff charge → approve → Tuesday
   transfer; a disputed week's partial refund visible in the Dashboard) and a
   $1 monthly MD hire. Admin Needs
   attention empty; cron ticks in the logs.
6. **Rollback:** flags off (backend + frontend) stops new charges and hides the
   features; paid weeks/months still review and settle. No schema rollback:
   every change is expand-only.
