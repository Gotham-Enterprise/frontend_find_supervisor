# Supervision Payments — Go-Live Checklist (non-code)

Companion to `supervision-payment-rules.md`. These items are outside the
codebase: legal copy, Stripe account settings and decisions that need a person.
Drafts below are starting points for legal review, not final language.

## 1. Terms of Service — clauses to add

**Payments through the platform.** Supervision fees agreed between a Supervisor
(including Medical Directors) and a Supervisee may be paid through Find a
Supervisor. Weekly agreements are prepaid at the start of each billing week
(Monday–Sunday, US Eastern) for the agreed maximum hours; after the Supervisee
reviews the week, only approved hours are kept and any unused prepay goes back
to the card. Monthly agreements are charged on the start date and the same day
each month; the platform holds each payment and releases it to the Medical
Director three days after the month ends unless a problem is reported.

**Service fee.** Each charge includes a service fee that covers card processing.
It is not returned when unused prepay or a disputed amount goes back to the
card.

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
