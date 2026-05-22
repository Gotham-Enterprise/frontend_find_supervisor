import type { FaqItem } from '@/lib/seo/jsonld'
import { generateFaqJsonLd } from '@/lib/seo/jsonld'

import { JsonLd } from './JsonLd'

interface FaqSectionProps {
  faqs: FaqItem[]
  heading?: string
}

/**
 * Renders a visible FAQ accordion-style list with FAQPage JSON-LD structured data.
 * Server Component — safe for pSEO pages.
 */
export function FaqSection({ faqs, heading = 'Frequently Asked Questions' }: FaqSectionProps) {
  if (faqs.length === 0) return null

  return (
    <>
      <JsonLd data={generateFaqJsonLd(faqs)} />

      <section aria-labelledby="faq-heading" className="mt-12">
        <h2 id="faq-heading" className="text-xl font-bold text-foreground">
          {heading}
        </h2>
        <div className="mt-4 divide-y rounded-xl border">
          {faqs.map((faq, i) => (
            <details key={i} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                <span>{faq.question}</span>
                <span
                  className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
