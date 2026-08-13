import Link from 'next/link'

import { SuperviseeCard } from '@/components/seo/SuperviseeCard'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisees } from '@/lib/api/public-supervisees'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'

const TEASER_LIMIT = 3

/**
 * Homepage teaser sections (async server component): a small sample of the
 * publicly browsable Supervisors and Supervisees with "See More" links into
 * the full browse pages. Each block hides itself when there is no data (e.g.
 * API unreachable), so the homepage never shows an empty grid.
 */
export async function BrowseTeasers() {
  const [{ supervisors }, { supervisees }] = await Promise.all([
    fetchPublicSupervisors({ limit: TEASER_LIMIT }),
    fetchPublicSupervisees({ limit: TEASER_LIMIT }),
  ])

  if (supervisors.length === 0 && supervisees.length === 0) return null

  return (
    <section className="bg-muted/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
        {supervisors.length > 0 && (
          <div>
            <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Featured Supervisors
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Licensed Supervisors and Collaborating Physicians accepting Supervisees right now.
                </p>
              </div>
              <Link
                href="/supervisors"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                See More Supervisors
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supervisors.map((supervisor) => (
                <SupervisorCard key={supervisor.id} supervisor={supervisor} />
              ))}
            </div>
          </div>
        )}

        {supervisees.length > 0 && (
          <div>
            <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Supervisees Looking for Supervision
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Pre-Licensed professionals actively looking for a Supervisor right now.
                </p>
              </div>
              <Link
                href="/browse-supervisees"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                See More Supervisees
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supervisees.map((supervisee, index) => (
                <SuperviseeCard key={supervisee.id} supervisee={supervisee} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
