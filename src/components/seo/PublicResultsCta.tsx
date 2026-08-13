import Link from 'next/link'

const COPY = {
  supervisor: {
    noun: 'Supervisor',
    signupHref: '/signup?type=supervisee',
    loginHref: '/login?redirect=/find-supervisors',
    moreBody: (total: number) =>
      `Sign up free to browse all ${total} matching Supervisors, filter by availability, patient population, fee range, and more.`,
    moreCta: 'Sign up to see all results',
    emptyHeading: 'Looking for more Supervisors?',
    emptyBody:
      'New Supervisors join regularly — create a free account to get matched and message them directly.',
    emptyCta: 'Create Free Account',
  },
  supervisee: {
    noun: 'Supervisee',
    signupHref: '/signup?type=supervisor',
    loginHref: '/login?redirect=/find-supervisees',
    moreBody: (total: number) =>
      `Sign up free to browse all ${total} matching Supervisees, see best matches for your profile, and send connection requests.`,
    moreCta: 'Sign up to see all results',
    emptyHeading: 'Looking for more Supervisees?',
    emptyBody:
      'New Supervisees join regularly — create a free Supervisor account to get matched and message them directly.',
    emptyCta: 'Create Free Supervisor Account',
  },
} as const

interface PublicResultsCtaProps {
  /** Which directory the results belong to; drives copy and signup audience. */
  role: keyof typeof COPY
  totalCount: number
  shownCount: number
  /** Optional heading context, e.g. 'in Alabama'. */
  context?: string
}

/**
 * Always-on sign-up CTA rendered under public results grids — the registration
 * funnel for guests. Shows a "X more available" variant when the guest cap hid
 * results, otherwise a generic "more join regularly" variant.
 */
export function PublicResultsCta({ role, totalCount, shownCount, context }: PublicResultsCtaProps) {
  const copy = COPY[role]
  const moreCount = Math.max(0, totalCount - shownCount)
  const hasMore = moreCount > 0
  const contextSuffix = context ? ` ${context}` : ''

  return (
    <div className="mt-8 rounded-xl border bg-muted/30 p-6 text-center">
      {hasMore ? (
        <>
          <p className="font-medium text-foreground">
            {moreCount} more {copy.noun}
            {moreCount !== 1 ? 's' : ''} available{contextSuffix}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.moreBody(totalCount)}</p>
        </>
      ) : (
        <>
          <p className="font-medium text-foreground">{copy.emptyHeading}</p>
          <p className="mt-1 text-sm text-muted-foreground">{copy.emptyBody}</p>
        </>
      )}
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={copy.signupHref}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {hasMore ? copy.moreCta : copy.emptyCta}
        </Link>
        <Link
          href={copy.loginHref}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          Sign In
        </Link>
      </div>
    </div>
  )
}
