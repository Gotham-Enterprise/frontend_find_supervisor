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
          'Your profile is hidden from search results until our admin team completes their review and approves your account. This is to ensure the quality and credibility of all supervisors on the platform. Once approved, your profile becomes publicly visible immediately. Review typically takes 2–3 business days.',
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
    title: 'Subscription & Billing',
    items: [
      {
        question: 'Do I need a paid subscription to get verified?',
        answer:
          'Yes. Subscribing to a paid plan is one of the steps in the setup checklist before your profile enters the admin review queue. Without an active subscription, your profile will not be reviewed.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer:
          'Go to Billing & Invoices in the sidebar and click "Manage Billing." From there you can cancel your plan. After canceling, you retain full platform access until the end of your current billing period. Your profile will be hidden from search once the subscription expires.',
      },
      {
        question: 'What happens to my profile if my subscription lapses?',
        answer:
          'Your profile will be hidden from supervisee searches if your subscription becomes inactive or unpaid. Reactivating your subscription will restore visibility (assuming your profile was previously approved).',
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
          "Go to Supervision Requests in the sidebar. Each request shows the supervisee's details and what they are looking for. You can accept or decline directly from that page. Accepted requests move the supervisee into your active Supervisees list.",
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
        question: 'How do I find the right supervisor for me?',
        answer:
          "Use the Find Supervisors page to search and filter by specialty, license type, location, supervision format (in-person/virtual/hybrid), availability, and fee range. Each profile shows the supervisor's credentials, bio, and reviews. You can also use the recommended supervisors shown on your dashboard.",
      },
      {
        question: 'What does it mean when a supervisor is "Verified"?',
        answer:
          'A verified supervisor has been reviewed and approved by our admin team. Their license document, credentials, and profile have been confirmed. All supervisors visible in search results are verified.',
      },
      {
        question: 'Can I message a supervisor before sending a hire request?',
        answer:
          'Yes. You can open a direct message conversation with any supervisor through their profile page. This is a great way to ask questions and gauge fit before committing to a supervision request.',
      },
      {
        question: 'How many supervisors can I connect with at once?',
        answer:
          'There is no hard limit on the number of supervisors you can message or request. However, we recommend focusing on a few strong matches to build quality supervision relationships.',
      },
    ],
  },
  {
    title: 'Supervision Requests & Status',
    items: [
      {
        question: 'What happens after I send a hire request?',
        answer:
          'The supervisor receives a notification and can review your request. While pending, the status shows as "Pending" on your Hired Supervisors page. The supervisor will accept or decline, and you will be notified of their decision.',
      },
      {
        question: 'What do the different hire request statuses mean?',
        answer:
          "Pending — your request has been sent and is awaiting the supervisor's response. Approved — the supervisor accepted your request and the supervision relationship is active. Declined — the supervisor is unable to take you on at this time. You can send a new request to a different supervisor.",
      },
      {
        question: 'Can I cancel a pending hire request?',
        answer:
          'Yes. Go to Hired Supervisors, find the request, and open its details. You will have the option to withdraw the request while it is still in a pending state.',
      },
      {
        question: 'How do I end a supervision relationship?',
        answer:
          'Go to Hired Supervisors and open the request details for your active supervisor. From there you can end the relationship. We recommend messaging the supervisor first to discuss the transition.',
      },
    ],
  },
  {
    title: 'Messaging',
    items: [
      {
        question: 'How does messaging work?',
        answer:
          "Go to Messages in the sidebar to see all your conversations. You can start a new conversation from any supervisor's profile. Messages are real-time — you will see when the other person is online and when they have read your message.",
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
        question: 'How do I leave a review for my supervisor?',
        answer:
          "After completing a supervision period, you will have the option to leave a review from your Hired Supervisors page or the supervisor's profile. Reviews include a star rating and written feedback.",
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
      ? 'Answers to common questions about verification, billing, profiles, and managing your supervisees.'
      : role === 'supervisee'
        ? 'Answers to common questions about finding supervisors, hire requests, messaging, and reviews.'
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
