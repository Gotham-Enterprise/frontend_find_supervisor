'use client'

import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isSuperviseeRole, isSupervisorRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/hooks'
import { cn } from '@/lib/utils'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  title: string
  items: FaqItem[]
}

const supervisorFaqs: FaqCategory[] = [
  {
    title: 'Account & Verification',
    items: [
      {
        question: 'Why is my profile not showing up in Supervisee searches?',
        answer:
          'Your profile is hidden from search results until our admin team completes their review and approves your account. This is to ensure the quality and credibility of all Supervisors on the platform. Once approved, your profile becomes publicly visible immediately. Review typically takes 2–3 business days.',
      },
      {
        question: 'How long does the verification process take?',
        answer:
          'Admin review typically takes 2–3 business days from when you complete your full profile and subscribe to a plan. You will receive a notification when a decision is made. To avoid delays, make sure your license document is clear and all required profile fields are filled out.',
      },
      {
        question: 'My profile was rejected — what do I do?',
        answer:
          'The specific rejection reason is shown on your dashboard under the Verification Status card. Fix the flagged issues (e.g. upload a clearer license document, complete your bio), then save your profile. It will automatically re-enter the review queue within 24 hours. There is no limit on resubmissions.',
      },
      {
        question: 'How do I update my license document after signup?',
        answer:
          'Go to My Profile and click "Edit Profile." Scroll to the License & Credentials section to upload a new document. If your license has expired, updating it will trigger a re-review of your profile.',
      },
      {
        question: 'What information does admin review check?',
        answer:
          'Admins verify your license document (clarity, expiration date, license number match), your professional summary, and overall profile completeness. Profiles with a clear photo, detailed bio, and all required fields filled are approved significantly faster.',
      },
    ],
  },
  {
    title: 'Free vs Paid Plans',
    items: [
      {
        question: 'What is the difference between the Free Plan and Platform Access?',
        answer:
          'Every Supervisor starts on the Find a Supervisor Free Plan. It lets you receive and view Supervisee requests, see which Supervisees are interested in you, appear in search results with a basic profile listing, and get platform notifications for new activity. Upgrading to Find a Supervisor Platform Access unlocks accepting Supervisee requests, full messaging with Supervisees, viewing Supervisee contact details where applicable, improved discoverability and profile exposure, and the full set of Supervisor platform tools.',
      },
      {
        question: 'What happens to supervision requests while I am on the Free Plan?',
        answer:
          'You still receive and can view every request, but accepting Supervisees is only available on the Platform Access plan. Incoming requests stay pending until you upgrade — nothing is lost, and you can accept them as soon as you move to a paid plan.',
      },
      {
        question: 'Why are Supervisee names and contact details partially hidden?',
        answer:
          'To protect Supervisee privacy, names are masked to a first name and last initial (e.g. "Katie C") until a supervision connection is accepted. Once you are connected, the full name is shown. Supervisee contact details are available on the Platform Access plan where applicable.',
      },
      {
        question: 'How do I upgrade to Platform Access?',
        answer:
          'Go to Billing & Invoices in the sidebar, or use the Upgrade option on your dashboard subscription card, and choose the Platform Access plan. Checkout is handled securely through Stripe, and paid features unlock as soon as your payment is confirmed.',
      },
      {
        question: 'Can I stay on the Free Plan indefinitely?',
        answer:
          'Yes. The Free Plan does not expire — your profile stays listed in search and you keep receiving requests and notifications. Many Supervisors start on the Free Plan to gauge Supervisee interest, then upgrade when they are ready to accept Supervisees and start messaging.',
      },
    ],
  },
  {
    title: 'Subscription & Billing',
    items: [
      {
        question: 'Do I need a paid subscription to get verified?',
        answer:
          'No. Every Supervisor account starts on the Free Plan automatically, and your profile enters the admin review queue once your email is verified and your full profile details are complete. A paid subscription is not required for verification — upgrading to Platform Access unlocks accepting requests, messaging, and improved discoverability.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer:
          'Go to Billing & Invoices in the sidebar. On that page, use Cancel Subscription on your current plan. After canceling, you retain full platform access until the end of your current billing period. Once it expires you move back to the Free Plan — you keep a basic search listing and can still view incoming requests, but paid features like accepting requests and messaging are locked.',
      },
      {
        question: 'Can I undo a cancellation before my billing period ends?',
        answer:
          'Yes. If you canceled but your access has not ended yet, open Billing & Invoices and click Resume subscription (or use the same option on your dashboard subscription card). Your plan will auto-renew on the next billing date.',
      },
      {
        question: 'What happens to my profile if my subscription lapses?',
        answer:
          'If your Platform Access subscription becomes inactive or unpaid, you move back to the Free Plan rather than losing your account. Your basic profile listing remains in search and you can still receive and view requests, but accepting requests, messaging, and premium discoverability are locked until you reactivate. Reactivating restores full access (assuming your profile was previously approved).',
      },
      {
        question: 'Can I switch between plans?',
        answer:
          'Yes. Go to Billing & Invoices and click "Manage Billing" to upgrade or downgrade your plan. Changes take effect at the start of your next billing cycle.',
      },
    ],
  },
  {
    title: 'Supervision Payments',
    items: [
      {
        question: 'How do Supervisees pay me through the app?',
        answer:
          "Supervision is billed hourly in the app. In each agreement you set your hourly rate, the maximum hours per week (1–40), and optionally the total hours the agreement covers. Your Supervisee saves a card and signs. Each billing week (Monday–Sunday, US Eastern) they prepay the weekly maximum up front. You log your sessions, they review them after the week, and you're paid for the approved hours — any unused prepay is refunded to them.",
      },
      {
        question: 'What do I need before I can send an hourly agreement?',
        answer:
          'A payout account. Go to Billing → Earnings and click Set Up Payment Information — Stripe verifies your identity and connects your bank account (US bank accounts only). Once your payouts show as Ready, you can send hourly agreements. The agreement start date can’t be in the past.',
      },
      {
        question: 'How do I log sessions?',
        answer:
          "Open Sessions on your Supervisee's card under My Supervisees. Log each session in 15-minute increments — you can't go over the weekly maximum or the agreement's total hours. You can log during the week and until Monday 11:59 PM (US Eastern) after it ends, and edit or delete sessions while the week is still open. We remind you on Friday and again on Monday if nothing is logged.",
      },
      {
        question: 'When do I get paid?',
        answer:
          "Right after your Supervisee approves the week's sessions — or automatically when their 3-day review ends (Thursday 11:59 PM US Eastern). You receive the approved hours × your hourly rate, minus the platform fee, and get a \"You've Been Paid\" notification and email. Stripe then deposits it to your bank on your payout schedule, usually within 2 business days, and we notify you when it's deposited.",
      },
      {
        question: 'What fees do I pay?',
        answer:
          'A platform fee (currently 10% of what you earn) is deducted from each payout. The exact rate is locked in when you send the agreement. You don’t pay card processing — Supervisees pay a separate service fee for that. Your Platform Access subscription is billed separately.',
      },
      {
        question: 'What happens if my Supervisee disputes a week?',
        answer:
          "The week is put on hold and Gotham support reviews your logged sessions and the Supervisee's reason and evidence. Support decides how many hours are paid; both of you are notified, and the week is then paid out to you for those hours.",
      },
      {
        question: "What if my Supervisee's weekly payment fails?",
        answer:
          'You\'ll get an "Unpaid Week" notification and email. Keep logging your sessions as usual — your Supervisee is asked to update their card and tap Pay now, and you\'re paid for the approved hours once the week is paid.',
      },
      {
        question: 'I forgot to log a session before the deadline. What can I do?',
        answer:
          "Request a late entry from the Supervisee's Sessions, within 14 days after that week ended. Gotham support adds it, and your Supervisee approves or rejects it. If that week was already paid out, the approved session is charged and paid to you on its own.",
      },
      {
        question: 'Why can’t I choose a monthly fee?',
        answer:
          'In-app billing covers hourly supervision, so Supervisors set an hourly rate. Medical Directors work on monthly retainers: their agreements record the monthly amount and duration, and they’re paid directly by their client outside the app. If your profile still shows a monthly fee from before, your agreements stay on monthly terms paid outside the app until you switch to Hourly in Edit Profile — after that, Monthly is no longer available.',
      },
      {
        question: 'How do I end a supervision?',
        answer:
          "Open the menu (⋮) on the Supervisee's card in My Supervisees and choose End Supervision. Pick Supervision Is Complete (it moves to Completed and they can leave you a review) or Ending Early (it moves to Closed), and add an optional note. Your Supervisee is notified by email and in the app. This can't be undone.",
      },
      {
        question: 'What happens if a supervision ends mid-week?',
        answer:
          "If that week's prepay was already charged, you can still log the week's sessions until its deadline, and the week is reviewed and paid out as usual. If it hadn't been charged yet, it's canceled. No new weeks are billed after a supervision ends.",
      },
    ],
  },
  {
    title: 'Payouts & Earnings',
    items: [
      {
        question: 'Where can I see what I’ve earned?',
        answer:
          'Go to Billing → Earnings. The Weekly Summary shows hours and pay for any week, Supervision Earnings shows totals paid out and in progress by Supervisee (with a CSV export), and the Payouts card shows where your money goes and your next and last payouts.',
      },
      {
        question: 'How do I change the bank account my payouts go to?',
        answer:
          'In Billing → Earnings, click Manage Account on the Payouts card. You can update your bank account and account details there — Stripe may ask you to verify it’s you first with a code. A payout already on its way still goes to your previous bank.',
      },
      {
        question: 'Can I remove my payout account?',
        answer:
          'Yes — use Remove Payout Account on the Payouts card. You can remove it once nothing depends on it: no active hourly supervisions, no weeks still waiting to be paid out to you, and a $0 Stripe balance. The dialog tells you what’s still in the way. Removing it deletes your Stripe payout account; your earnings history stays, and you can set up payouts again anytime.',
      },
      {
        question: 'What if a payout to my bank fails?',
        answer:
          'We notify you and email you. The money goes back to your Stripe balance and is sent with your next payout once you update your bank details in Billing → Earnings → Manage Account.',
      },
    ],
  },
  {
    title: 'Profile & Availability',
    items: [
      {
        question: 'How do I update my availability or supervision fees?',
        answer:
          'Click "Edit Profile" from your dashboard or visit My Profile. You can update your availability, fee amount, and fee type at any time. Changes are reflected on your profile immediately — no re-verification is required for these updates.',
      },
      {
        question: 'Can I pause accepting new Supervisees?',
        answer:
          'Yes. In your profile editor, toggle the "Accepting Supervisees" switch to off. This updates your profile status to "Not accepting" without affecting your visibility or verified status.',
      },
      {
        question: 'How do I improve my profile completion score?',
        answer:
          'Your profile completion percentage tracks 14 fields: profile photo, license type, occupation, license number or document, state of licensure, years of experience, supervision format, availability, fee, professional summary, certifications, patient populations, city, and state. Fill all of these to reach 100%.',
      },
    ],
  },
  {
    title: 'Medical Directors',
    items: [
      {
        question: 'I signed up as a Medical Director — how is my account different?',
        answer:
          'Medical Director accounts use a dedicated signup with physician credentials (MD/DO), optional board certifications, and monthly-only fees. Instead of appearing in the regular Supervisor search, your profile is listed on the Find Medical Directors page for people looking for medical direction. Everything else — verification, plans, messaging, and reviews — works the same as for Supervisors.',
      },
      {
        question: 'What are "Additional Physician Offerings"?',
        answer:
          'As a Medical Director you can also offer Supervising Physician and/or Collaborating Physician services for PAs and NPs. Each offering has its own credentials and license entries. With an offering enabled, your profile also appears in the regular Supervisor search under that role — your card shows every role you hold (e.g. "Medical Director · Supervising Physician"). You can manage offerings from Edit Profile.',
      },
      {
        question: 'Where do I see clients who hired me as a Medical Director?',
        answer:
          'They are listed on the Medical Director Clients page in the sidebar. If you also provide supervision through a physician offering, those Supervisees appear separately under My Supervisees — each hire is filed by the role you were hired for.',
      },
      {
        question: 'How do board certifications work?',
        answer:
          'You can add board certifications during signup or later from Edit Profile — each entry needs the certifying board, specialty, certification number, and expiration date. Certifications are displayed on your public profile, but your certification numbers are only visible to you.',
      },
      {
        question: 'Why can’t I change my Supervisor Type?',
        answer:
          'Medical Director accounts are a distinct account type with their own credentials and review flow, so the type is locked after signup. If you believe your account was created under the wrong type, contact support and we will help you sort it out.',
      },
    ],
  },
  {
    title: 'Supervisees & Messaging',
    items: [
      {
        question: 'How do Supervisees contact me?',
        answer:
          'Once your profile is approved and visible, Supervisees can send you a supervision request or a direct message through the platform. You will receive a notification for each new request or message. Manage incoming requests under the Supervision Requests page.',
      },
      {
        question: 'How do I accept or decline a supervision request?',
        answer:
          "Go to Supervision Requests in the sidebar. Each request shows the Supervisee's details and what they are looking for. You can accept or decline directly from that page. Accepted requests move the Supervisee into your active Supervisees list. Note that accepting requests requires the Platform Access plan — on the Free Plan, requests remain pending until you upgrade.",
      },
      {
        question: 'How do I leave or view reviews?',
        answer:
          'Go to Reviews in the sidebar to see all reviews Supervisees have left for you. Reviews are displayed publicly on your profile and help build trust with future Supervisees.',
      },
    ],
  },
]

const superviseeFaqs: FaqCategory[] = [
  {
    title: 'Finding a Supervisor',
    items: [
      {
        question: 'How do I find the right Supervisor for me?',
        answer:
          "Use the Find Supervisors page to search and filter by specialty, license type, location, supervision format (in-person/virtual/hybrid), availability, and fee range. Each profile shows the Supervisor's credentials, bio, and reviews. You can also use the recommended Supervisors shown on your dashboard.",
      },
      {
        question: 'What does it mean when a Supervisor is "Verified"?',
        answer:
          'A verified Supervisor has been reviewed and approved by our admin team. Their license document, credentials, and profile have been confirmed. All Supervisors visible in search results are verified.',
      },
      {
        question: 'Can I message a Supervisor before sending a hire request?',
        answer:
          'Yes. You can open a direct message conversation with any Supervisor through their profile page. This is a great way to ask questions and gauge fit before committing to a supervision request.',
      },
      {
        question: 'How many Supervisors can I connect with at once?',
        answer:
          'There is no hard limit on the number of Supervisors you can message or request. However, we recommend focusing on a few strong matches to build quality supervision relationships.',
      },
    ],
  },
  {
    title: 'Medical Directors',
    items: [
      {
        question: 'How do I find a Medical Director?',
        answer:
          'If your profile includes a Medical Director need, a Find Medical Directors page appears in your sidebar. It works like the Supervisor search — filter by specialty, state, and format — and every listed Medical Director is verified. Open a profile and use "Hire as Medical Director" to send a request.',
      },
      {
        question: 'Why don’t I see the Find Medical Directors page?',
        answer:
          'It only appears when your profile says you need a Medical Director. Open Edit Profile, check "I need a Medical Director" under the Medical Director Needs section, fill in your timeline, monthly budget, and a short description of your ideal Medical Director, then save. The page appears immediately.',
      },
      {
        question: 'Can I look for a Supervisor and a Medical Director at the same time?',
        answer:
          'Yes. The two needs are tracked separately, each with its own preferences — your supervision need keeps its own budget and timeline, and your Medical Director need has a separate monthly budget, timeline, and description. Your dashboard shows separate recommendations for each, and the Find pages are separate as well.',
      },
      {
        question: 'Why is the Medical Director budget monthly only?',
        answer:
          'Medical Directors on the platform work on a monthly retainer basis, so their fees and your budget are always expressed per month. Supervision budgets can still be hourly or monthly.',
      },
      {
        question: 'Where do I see the Medical Directors I’ve hired?',
        answer:
          'They are listed on the Hired Medical Directors page in your sidebar, separate from Hired Supervisors. Requests, statuses, agreements, and reviews work the same way on both pages.',
      },
      {
        question:
          'Why does a search card show more than one role, like "Medical Director · Supervising Physician"?',
        answer:
          'Some physicians serve in more than one capacity — for example a Medical Director who also offers Supervising Physician services for PAs. The card lists every role they hold; which one you hire them for depends on the page you found them on.',
      },
    ],
  },
  {
    title: 'Supervision Requests & Status',
    items: [
      {
        question: 'What happens after I send a hire request?',
        answer:
          'The Supervisor receives a notification and can review your request. While pending, the status shows as "Pending" on your Hired Supervisors page. The Supervisor will accept or decline, and you will be notified of their decision.',
      },
      {
        question: 'What do the different hire request statuses mean?',
        answer:
          "Pending — your request has been sent and is awaiting the Supervisor's response. Accepted — the Supervisor accepted your request; next they send you an agreement to review and sign. In Progress — supervision is underway (for hourly agreements, once your first weekly payment goes through). Completed — the supervision has ended. Rejected — the Supervisor is unable to take you on at this time; you can send a new request to a different Supervisor.",
      },
      {
        question: 'Can I cancel a pending hire request?',
        answer:
          "Yes. Go to Hired Supervisors and open the Supervisor's menu (⋮), on their card or in their workroom, then choose Cancel Request while it is still pending.",
      },
      {
        question: 'Where do I see everything about one supervision?',
        answer:
          "Click your Supervisor's name in Hired Supervisors to open the workroom for that supervision. Overview shows this week's cost and anything that needs you; Timesheet shows the logged hours by day and week, where you approve or dispute; Messages is your conversation for this supervision; Contract details has the agreement and your request. Each supervision has its own workroom and its own messages, even with the same Supervisor.",
      },
      {
        question: 'How do I end a supervision relationship?',
        answer:
          "Open the menu (⋮) on your Supervisor's card in Hired Supervisors, or in their workroom: choose Mark as Completed once the supervision is done (you can then leave a review), or Cancel Request to stop it. Your Supervisor can also end it from their side — you'll get a notification and an email. We recommend messaging them first to discuss the transition.",
      },
    ],
  },
  {
    title: 'Supervision Payments',
    items: [
      {
        question: 'How does paying my Supervisor work?',
        answer:
          'You pay your Supervisor through the app. When you sign the agreement you save a card. Each billing week (Monday–Sunday, US Eastern) your card is charged a weekly prepay — the hourly rate × the maximum hours per week, plus a service fee. After the week you review the sessions your Supervisor logged and pay only for the hours you approve; the unused prepay is refunded to your card.',
      },
      {
        question: 'What is the service fee?',
        answer:
          'It covers secure card processing by Stripe (2.9% + 30¢ of the charge) and is added to each weekly charge and any late-session charge. It isn’t refunded, because Stripe keeps its processing fee on refunds. You see the exact weekly total before you sign.',
      },
      {
        question: 'When is my card charged?',
        answer:
          "Your first prepay is charged on the agreement's start date (right away if that's today), then every Monday at 12:00 AM US Eastern. Saving or changing a card doesn't charge anything on its own.",
      },
      {
        question: 'How do I review my sessions?',
        answer:
          "After each week your Supervisor logs their sessions (by Monday 11:59 PM US Eastern) and you get a notification to review them in the Supervisor's workroom (Timesheet). Approve or dispute by Thursday 11:59 PM US Eastern — if you don't respond, the week is approved automatically. If no sessions were logged, your prepay is refunded in full (minus the service fee).",
      },
      {
        question: 'How do I dispute a week?',
        answer:
          'Open that Supervisor’s workroom and go to Timesheet. Choose Dispute under Last week (or on the week in Week Details) and explain what’s wrong — you can attach up to 3 images (JPG or PNG, 5 MB each). Gotham support reviews it and decides how many hours are paid; anything not paid is refunded to your card. You’re both notified of the outcome.',
      },
      {
        question: 'When will I get my refund?',
        answer:
          'Unused prepay is refunded to the card you paid with as soon as the week is approved (or a dispute is resolved). Your bank usually shows it within 5–10 business days.',
      },
      {
        question: 'What if my weekly payment fails?',
        answer:
          "You'll get a notification and an email. Update your card if needed, then tap Pay now in the Supervisor's workroom (Overview or Timesheet) or on your Billing page. Failed payments aren't retried automatically, and your Supervisor is paid for the week only after it's paid.",
      },
      {
        question: 'How do I change or remove a card?',
        answer:
          "Each supervision has its own card. Use Change Card in the Supervisor's workroom (Contract details or Timesheet) to switch which saved card pays for it, and manage your saved cards on the Billing page. A card that pays for an active supervision can't be removed until you switch that supervision to another card.",
      },
      {
        question: 'What is a late session?',
        answer:
          "If your Supervisor missed logging a session, they can ask Gotham support to add it within 14 days after that week. You'll be asked to approve or reject it. If that week was already settled, an approved late session is charged on its own (hours × rate plus the service fee).",
      },
      {
        question: 'What happens if I end a supervision mid-week?',
        answer:
          "If this week's prepay was already charged, the week is still reviewed — you pay only for approved hours and the rest is refunded. If it hadn't been charged yet, it won't be. There are no more weekly charges after a supervision ends.",
      },
      {
        question: 'Do Medical Directors bill through the app?',
        answer:
          'No. Medical Directors work on monthly retainers: the agreement records the monthly amount and duration, and you pay them directly outside the app. (A few Supervisors who set a monthly fee before in-app billing are paid the same way until they switch to an hourly rate.)',
      },
    ],
  },
  {
    title: 'Messaging',
    items: [
      {
        question: 'How does messaging work?',
        answer:
          "Go to Messages in the sidebar to see all your conversations. You can start a new conversation from any Supervisor's profile. Messages are real-time — you will see when the other person is online and when they have read your message.",
      },
      {
        question: 'Will I be notified of new messages?',
        answer:
          'Yes. Unread message counts appear as badges on the Messages item in the sidebar. Make sure your notification settings allow browser notifications for the best experience.',
      },
    ],
  },
  {
    title: 'Reviews',
    items: [
      {
        question: 'How do I leave a review for my Supervisor?',
        answer:
          "After completing a supervision period, you will have the option to leave a review from your Hired Supervisors page or the Supervisor's profile. Reviews include a star rating and written feedback.",
      },
      {
        question: 'Can I edit or delete a review I left?',
        answer:
          'Reviews can be edited within a limited window after submission. Contact support if you need to remove a review that was submitted in error.',
      },
    ],
  },
]

const sharedFaqs: FaqCategory[] = [
  {
    title: 'Account & Settings',
    items: [
      {
        question: 'How do I change my password?',
        answer:
          'Go to Settings in the sidebar. Under the Security section you will find the option to change your password. You will need to confirm your current password before setting a new one.',
      },
      {
        question: 'How do I update my email address?',
        answer:
          'Email address changes are handled through Settings. After updating, you will receive a verification email to confirm the new address before the change takes effect.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Account deletion requests must be submitted through our support team. Contact us via chat or email and we will process the request. Note that deletion is permanent and cannot be undone.',
      },
    ],
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function FaqItem({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('border-b last:border-b-0', open && 'pb-2')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            'text-sm font-medium leading-snug',
            open ? 'text-primary' : 'text-foreground',
          )}
        >
          {question}
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>}
    </div>
  )
}

function FaqCategoryCard({ title, items }: FaqCategory) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        {items.map((item) => (
          <FaqItem key={item.question} {...item} />
        ))}
      </CardContent>
    </Card>
  )
}

function PageHeader({ role }: { role: 'supervisor' | 'supervisee' | 'general' }) {
  const subtitle =
    role === 'supervisor'
      ? 'Answers to common questions about verification, plans, supervision payments and payouts, profiles, and managing your Supervisees.'
      : role === 'supervisee'
        ? 'Answers to common questions about finding Supervisors, hire requests, supervision payments, messaging, and reviews.'
        : 'Answers to common questions about the platform.'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
      <div className="flex items-start gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <HelpCircle className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed opacity-80">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function ContactSupport() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold">Still have questions?</p>
          <p className="text-sm text-muted-foreground">
            Our support team is available to help with anything not covered above.
          </p>
        </div>
        <Link
          href="/contact-us"
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <MessageCircle className="size-4 text-primary" />
          Contact Us
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FaqPage() {
  const { user } = useUser()
  const role = user?.role

  const isSupervisor = isSupervisorRole(role)
  const isSupervisee = isSuperviseeRole(role)

  const roleLabel = isSupervisor ? 'supervisor' : isSupervisee ? 'supervisee' : 'general'

  const categories: FaqCategory[] = [
    ...(isSupervisor ? supervisorFaqs : []),
    ...(isSupervisee ? superviseeFaqs : []),
    ...sharedFaqs,
  ]

  return (
    <div className="space-y-6">
      <PageHeader role={roleLabel} />

      <div className="grid gap-5 lg:grid-cols-2">
        {categories.map((cat) => (
          <FaqCategoryCard key={cat.title} {...cat} />
        ))}
      </div>

      <ContactSupport />

      <div className="flex justify-start">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
