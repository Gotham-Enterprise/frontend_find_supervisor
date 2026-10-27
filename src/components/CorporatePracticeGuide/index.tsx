import {
  AlertTriangleIcon,
  CheckIcon,
  ExternalLinkIcon,
  LandmarkIcon,
  LockIcon,
} from 'lucide-react'

import {
  type CorporatePracticeStatus,
  getCorporatePracticeRule,
} from '@/lib/constants/corporate-practice-of-medicine'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<
  CorporatePracticeStatus,
  { label: string; className: string; Icon: typeof CheckIcon }
> = {
  STRICT: {
    label: 'Strict',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    Icon: LockIcon,
  },
  EXCEPTIONS: {
    label: 'Restricted, with exceptions',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    Icon: AlertTriangleIcon,
  },
  PERMISSIVE: {
    label: 'Few restrictions',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Icon: CheckIcon,
  },
}

function formatReviewedDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

interface CorporatePracticeGuideProps {
  /** US state code (e.g. "TX"). */
  stateCode: string
  /** Display name (e.g. "Texas"). */
  stateName: string
}

/**
 * Corporate Practice of Medicine (CPOM) status for one state, shown on the
 * public /medical-directors/[state] pages for people looking to hire a Medical
 * Director: whether a non-physician can generally own the practice and engage
 * a physician, with a short summary and the source. Informational only.
 *
 * Hook-free so it renders on the server (text is in the HTML for search
 * engines). Renders nothing for states without a reviewed entry.
 */
export function CorporatePracticeGuide({ stateCode, stateName }: CorporatePracticeGuideProps) {
  const rule = getCorporatePracticeRule(stateCode)
  if (!rule) return null

  const { label, className, Icon } = STATUS_STYLES[rule.status]

  return (
    <section
      aria-labelledby="cpom-heading"
      className="space-y-2 rounded-xl border border-border bg-card px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="cpom-heading"
          className="flex items-start gap-2 text-base font-semibold text-foreground"
        >
          <LandmarkIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
          Corporate Practice of Medicine in {stateName}
        </h2>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-medium',
            className,
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          {label}
        </span>
      </div>

      <p className="text-sm text-foreground">{rule.summary}</p>

      <p className="text-sm text-muted-foreground">
        Source:{' '}
        <a
          href={rule.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
        >
          {rule.sourceLabel}
          <ExternalLinkIcon className="size-3.5" aria-hidden />
        </a>{' '}
        ({rule.citation})
      </p>

      <p className="text-sm text-muted-foreground">
        General information, not legal advice. Talk to a healthcare attorney in {stateName} before
        setting up your practice. Last reviewed {formatReviewedDate(rule.lastReviewed)}.
      </p>
    </section>
  )
}
