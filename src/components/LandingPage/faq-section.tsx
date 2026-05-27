'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What types of supervisors can I find on this platform?',
    answer:
      'Find A Supervisor supports mental health counselor supervisors, collaborating physicians for nurse practitioners, and supervising physicians for physician assistants. You can filter by supervisor type, specialty, state, and supervision format to find the right match for your profession.',
  },
  {
    question: 'What is the matching feature?',
    answer:
      'Our matching feature helps you discover vetted supervisors and collaborating physicians based on your specialty, location, schedule, and supervision requirements. You can browse profiles, compare options, and connect directly with qualified professionals.',
  },
  {
    question: 'Can I customize my messages to supervisors?',
    answer:
      'Yes. You can personalize your introduction and messages when reaching out to supervisors or collaborating physicians. We recommend including your background, goals, and what you hope to achieve to improve your response rate.',
  },
  {
    question: 'How does scheduling work?',
    answer:
      'Once you connect with a supervisor or collaborating physician, you can schedule sessions directly through the platform. Choose from available time slots, set up recurring meetings, and manage your supervision calendar from your dashboard.',
  },
  {
    question: 'Is there a limit to how many supervisors I can connect with?',
    answer:
      'You can browse and connect with multiple supervisors or collaborating physicians. We recommend focusing on a few strong matches to ensure quality professional relationships and efficient progress toward your goals.',
  },
  {
    question: 'How is this different from traditional supervision matching?',
    answer:
      'Traditional matching requires you to manage each connection separately. With our platform, you can browse vetted healthcare supervisors, collaborating physicians, and supervising physicians — then communicate through personalized introductions, all in one place.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-background py-20 sm:py-24">
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
