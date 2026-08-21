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
        question: 'Why is my profile not showing up in supervisee searches?',
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
          'Every Supervisor starts on the Find a Supervisor Free Plan. It lets you receive and view supervisee requests, see which supervisees are interested in you, appear in search results with a basic profile listing, and get platform notifications for new activity. Upgrading to Find a Supervisor Platform Access unlocks accepting supervisee requests, full messaging with supervisees, viewing supervisee contact details where applicable, improved discoverability and profile exposure, and the full set of Supervisor platform tools.',
      },
      {
        question: 'What happens to supervision requests while I am on the Free Plan?',
        answer:
          'You still receive and can view every request, but accepting supervisees is only available on the Platform Access plan. Incoming requests stay pending until you upgrade — nothing is lost, and you can accept them as soon as you move to a paid plan.',
      },
      {
        question: 'Why are supervisee names and contact details partially hidden?',
        answer:
          'To protect supervisee privacy, names are masked to a first name and last initial (e.g. "Katie C") until a supervision connection is accepted. Once you are connected, the full name is shown. Supervisee contact details are available on the Platform Access plan where applicable.',
      },
      {
        question: 'How do I upgrade to Platform Access?',
        answer:
          'Go to Billing & Invoices in the sidebar, or use the Upgrade option on your dashboard subscription card, and choose the Platform Access plan. Checkout is handled securely through Stripe, and paid features unlock as soon as your payment is confirmed.',
      },
      {
        question: 'Can I stay on the Free Plan indefinitely?',
        answer:
          'Yes. The Free Plan does not expire — your profile stays listed in search and you keep receiving requests and notifications. Many Supervisors start on the Free Plan to gauge supervisee interest, then upgrade when they are ready to accept supervisees and start messaging.',
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
    title: 'Profile & Availability',
    items: [
      {
        question: 'How do I update my availability or supervision fees?',
        answer:
          'Click "Edit Profile" from your dashboard or visit My Profile. You can update your availability, fee amount, and fee type at any time. Changes are reflected on your profile immediately — no re-verification is required for these updates.',
      },
      {
        question: 'Can I pause accepting new supervisees?',
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
          'Medical Director accounts use a dedicated signup with physician credentials (MD/DO), optional board certifications, and monthly-only fees. Instead of appearing in the regular supervisor search, your profile is listed on the Find Medical Directors page for people looking for medical direction. Everything else — verification, plans, messaging, and reviews — works the same as for Supervisors.',
      },
      {
        question: 'What are "Additional Physician Offerings"?',
        answer:
          'As a Medical Director you can also offer Supervising Physician and/or Collaborating Physician services for PAs and NPs. Each offering has its own credentials and license entries. With an offering enabled, your profile also appears in the regular supervisor search under that role — your card shows every role you hold (e.g. "Medical Director · Supervising Physician"). You can manage offerings from Edit Profile.',
      },
      {
        question: 'Where do I see clients who hired me as a Medical Director?',
        answer:
          'They are listed on the Medical Director Clients page in the sidebar. If you also provide supervision through a physician offering, those supervisees appear separately under My Supervisees — each hire is filed by the role you were hired for.',
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
        question: 'How do supervisees contact me?',
        answer:
          'Once your profile is approved and visible, supervisees can send you a supervision request or a direct message through the platform. You will receive a notification for each new request or message. Manage incoming requests under the Supervision Requests page.',
      },
      {
        question: 'How do I accept or decline a supervision request?',
        answer:
          "Go to Supervision Requests in the sidebar. Each request shows the supervisee's details and what they are looking for. You can accept or decline directly from that page. Accepted requests move the supervisee into your active Supervisees list. Note that accepting requests requires the Platform Access plan — on the Free Plan, requests remain pending until you upgrade.",
      },
      {
        question: 'How do I leave or view reviews?',
        answer:
          'Go to Reviews in the sidebar to see all reviews supervisees have left for you. Reviews are displayed publicly on your profile and help build trust with future supervisees.',
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
          'If your profile includes a Medical Director need, a Find Medical Directors page appears in your sidebar. It works like the supervisor search — filter by specialty, state, and format — and every listed Medical Director is verified. Open a profile and use "Hire as Medical Director" to send a request.',
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
          "Pending — your request has been sent and is awaiting the Supervisor's response. Approved — the Supervisor accepted your request and the supervision relationship is active. Declined — the Supervisor is unable to take you on at this time. You can send a new request to a different Supervisor.",
      },
      {
        question: 'Can I cancel a pending hire request?',
        answer:
          'Yes. Go to Hired Supervisors, find the request, and open its details. You will have the option to withdraw the request while it is still in a pending state.',
      },
      {
        question: 'How do I end a supervision relationship?',
        answer:
          'Go to Hired Supervisors and open the request details for your active Supervisor. From there you can end the relationship. We recommend messaging the Supervisor first to discuss the transition.',
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
      ? 'Answers to common questions about verification, plans and billing, profiles, and managing your supervisees.'
      : role === 'supervisee'
        ? 'Answers to common questions about finding Supervisors, hire requests, messaging, and reviews.'
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
