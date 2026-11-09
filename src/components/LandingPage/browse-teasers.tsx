import Link from 'next/link'

import { SuperviseeCard } from '@/components/seo/SuperviseeCard'
import { SupervisorCard } from '@/components/seo/SupervisorCard'
import { fetchPublicSupervisees } from '@/lib/api/public-supervisees'
import { fetchPublicSupervisors } from '@/lib/api/public-supervisors'

const TEASER_LIMIT = 3

/**
 * Guards against baking an API outage into the cached homepage.
 *
 * In production (build + ISR regeneration) a failed call throws so the render
 * is abandoned rather than cached blank. In development the homepage must stay
 * usable while the backend is down, so we only log and let the blocks hide.
 */
export function assertPublicDataAvailable(
  status: Record<string, boolean>,
  env: string | undefined = process.env.NODE_ENV,
): void {
  const failed = Object.entries(status)
    .filter(([, ok]) => !ok)
    .map(([name]) => name)
  if (failed.length === 0) return

  const message = `[browse-teasers] Public API unavailable for: ${failed.join(', ')}`
  if (env === 'production') {
    throw new Error(`${message}. Refusing to cache the homepage without its featured sections.`)
  }
  console.warn(`${message}. Featured sections will be hidden for this render.`)
}

/**
 * Homepage teaser sections (async server component): a small sample of the
 * publicly browsable Supervisors, Medical Directors, and Supervisees with
 * "See More" links into the full browse pages. A block hides itself when the
 * API answered with zero rows, so the homepage never shows an empty grid.
 *
 * The homepage is prerendered (ISR, 1h). If the API call itself fails we must
 * NOT render the "no data" variant, because Next would cache that blank page
 * for an hour (or, at build time, ship it to production). Throwing instead
 * fails the build loudly and, during ISR regeneration, makes Next keep serving
 * the last good version. See {@link assertPublicDataAvailable}.
 */
export async function BrowseTeasers() {
  const [supervisorResult, medicalDirectorResult, superviseeResult] = await Promise.all([
    fetchPublicSupervisors({ limit: TEASER_LIMIT, searchMode: 'supervisors' }),
    fetchPublicSupervisors({ limit: TEASER_LIMIT, searchMode: 'medicalDirectors' }),
    fetchPublicSupervisees({ limit: TEASER_LIMIT }),
  ])

  assertPublicDataAvailable({
    supervisors: supervisorResult.ok,
    medicalDirectors: medicalDirectorResult.ok,
    supervisees: superviseeResult.ok,
  })

  const { supervisors } = supervisorResult
  const { supervisors: medicalDirectors } = medicalDirectorResult
  const { supervisees } = superviseeResult

  if (supervisors.length === 0 && medicalDirectors.length === 0 && supervisees.length === 0) {
    return null
  }

  return (
    <section className="bg-muted/30 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
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

        {medicalDirectors.length > 0 && (
          <div>
            <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Featured Medical Directors
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Verified MDs and DOs providing oversight for med spas, clinics, and practices.
                </p>
              </div>
              <Link
                href="/medical-directors"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                See More Medical Directors
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {medicalDirectors.map((medicalDirector) => (
                <SupervisorCard key={medicalDirector.id} supervisor={medicalDirector} />
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
