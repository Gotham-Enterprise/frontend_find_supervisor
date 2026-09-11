'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'How does Find A Supervisor work?',
    answer:
      'Supervisors create a profile that is verified by our admin team before appearing in search. Supervisees then browse and filter verified Supervisors and send a supervision request or message to the ones that fit. To accept a request and start the relationship, the Supervisor needs an active Platform Access subscription — on the Free Plan, requests stay pending until they upgrade. Once connected, both sides manage messaging, requests, and reviews from their dashboard.',
  },
  {
    question: 'What types of Supervisors can I find on this platform?',
    answer:
      'Find A Supervisor supports Mental Health Counselor Supervisors, Collaborating Physicians for nurse practitioners, Supervising Physicians for physician assistants, and Medical Directors for practices that need medical direction. You can filter by Supervisor type, specialty, state, and supervision format to find the right match for your profession.',
  },
  {
    question: 'Can I find a Medical Director here?',
    answer:
      'Yes. If your profile says you need a Medical Director, a dedicated Find Medical Directors page appears in your account. It works like the supervisor search — filter verified Medical Directors by specialty, state, and format, then send a hire request from their profile. Medical Directors work on a monthly retainer basis, and your Medical Director need is tracked separately from your supervision need, each with its own budget and timeline.',
  },
  {
    question: 'I am a physician — can I join as a Medical Director?',
    answer:
      'Yes. Medical Directors sign up with their own dedicated flow: physician credentials (MD/DO), optional board certifications, and monthly-only fees. Your profile is listed on the Find Medical Directors page for people seeking medical direction, and you can additionally offer Supervising Physician and/or Collaborating Physician services for PAs and NPs — each offering with its own credentials. Verification, plans, messaging, and reviews work the same as for other Supervisors.',
  },
  {
    question: 'What is the matching feature?',
    answer:
      'Our matching feature helps you discover vetted Supervisors and Collaborating Physicians based on your specialty, location, schedule, and supervision requirements. You can browse profiles, compare options, and connect directly with qualified professionals.',
  },
  {
    question: 'Can I customize my messages to Supervisors?',
    answer:
      'Yes. You can personalize your introduction and messages when reaching out to Supervisors or Collaborating Physicians. We recommend including your background, goals, and what you hope to achieve to improve your response rate.',
  },
  {
    question: 'How does scheduling work?',
    answer:
      'Once you connect with a Supervisor or Collaborating Physician, you coordinate session timing directly with them through the built-in messaging. Your upcoming supervision sessions are shown on your dashboard so you always know what is next.',
  },
  {
    question: 'Is there a limit to how many Supervisors I can connect with?',
    answer:
      'You can browse and connect with multiple Supervisors or Collaborating Physicians. We recommend focusing on a few strong matches to ensure quality professional relationships and efficient progress toward your goals.',
  },
  {
    question: 'Is it free for Supervisors to join?',
    answer:
      'Yes. Every Supervisor starts on the Find a Supervisor Free Plan, which includes a basic profile listing in search, visibility into interested supervisees, the ability to receive and view supervision requests, and platform notifications for new activity. There is no time limit — you can stay on the Free Plan for as long as you like.',
  },
  {
    question: 'What is the difference between the Free Plan and Platform Access?',
    answer:
      'Every Supervisor starts on the Find a Supervisor Free Plan. It lets you receive and view supervisee requests, see which supervisees are interested in you, appear in search results with a basic profile listing, and get platform notifications for new activity. Upgrading to Find a Supervisor Platform Access unlocks accepting supervisee requests, full messaging with supervisees, viewing supervisee contact details where applicable, improved discoverability and profile exposure, and the full set of Supervisor platform tools.',
  },
  {
    question: 'How is this different from traditional supervision matching?',
    answer:
      'Traditional matching requires you to manage each connection separately. With our platform, you can browse vetted healthcare Supervisors, Collaborating Physicians, and Supervising Physicians — then communicate through personalized introductions, all in one place.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="scroll-mt-16 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold uppercase tracking-wide text-foreground sm:text-3xl">
          FAQ
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className={cn(
                  'overflow-hidden rounded-xl border shadow-sm transition-colors',
                  isOpen
                    ? 'border-primary bg-brand-light'
                    : 'border-border bg-card hover:border-border/80',
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-medium transition-colors',
                    isOpen ? 'text-primary' : 'text-foreground hover:text-primary',
                  )}
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0" />
                  )}
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    isOpen ? 'max-h-96' : 'max-h-0',
                  )}
                >
                  <p className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
