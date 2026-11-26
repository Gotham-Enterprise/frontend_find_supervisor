/**
 * Public Preceptor profile — /preceptors/[state]/[id]
 * e.g. /preceptors/california/46e0579d-ec2f-4893-8277-7e4e6220757d
 *
 * Only primary Preceptors render here; any other supervisor permanently
 * redirects to its canonical directory URL. Unknown or hidden profiles 404.
 * Rendered on demand with ISR (public-profile fetch revalidates hourly).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { SupervisorPublicProfile } from '@/components/seo/SupervisorPublicProfile'
import {
  fetchPublicSupervisorById,
  isPublicPreceptor,
  publicDirectoryFor,
  type PublicSupervisorSummary,
} from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateSupervisorJsonLd } from '@/lib/seo/jsonld'
import {
  isUUID,
  isValidStateSlug,
  PRECEPTORS_PATH,
  profileStateSlug,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  TOP_STATE_SLUGS,
} from '@/lib/seo/routes'

interface Props {
  params: Promise<{ state: string; id: string }>
}

export const dynamicParams = true

/**
 * Resolves the Preceptor for this URL — 404 for invalid params or unknown
 * profiles, permanent redirect for non-preceptor supervisors.
 */
async function resolvePreceptor(stateSlug: string, id: string): Promise<PublicSupervisorSummary> {
  if (!isValidStateSlug(stateSlug) || !isUUID(id)) notFound()

  const supervisor = await fetchPublicSupervisorById(id)
  if (!supervisor) notFound()

  if (!isPublicPreceptor(supervisor)) {
    permanentRedirect(`${publicDirectoryFor(supervisor)}/${stateSlug}/${id}`)
  }

  return supervisor
}

/**
 * State pages link here under the browsed state; point every variant at one
 * canonical URL so search engines index a single profile.
 */
function canonicalProfilePath(supervisor: PublicSupervisorSummary, stateSlug: string): string {
  const canonicalStateSlug =
    profileStateSlug(supervisor.state, supervisor.stateOfLicensure) ?? stateSlug
  return `${PRECEPTORS_PATH}/${canonicalStateSlug}/${supervisor.id}`
}

/** "Dentist Preceptor" when the discipline is known, else "Preceptor". */
function preceptorLabel(supervisor: PublicSupervisorSummary): string {
  return supervisor.occupation ? `${supervisor.occupation} Preceptor` : 'Preceptor'
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, id } = await params
  const supervisor = await resolvePreceptor(stateSlug, id)
  const stateName = stateSlugToDisplayName(stateSlug)
  const specialty = supervisor.specialty ? `${supervisor.specialty} ` : ''

  return buildMetadata({
    title: `${supervisor.fullName}, ${preceptorLabel(supervisor)} in ${stateName}`,
    description: `View ${supervisor.fullName}'s ${specialty}preceptor profile, including discipline, licensed states, format, fee, and professional background. Connect with verified preceptors for your clinical rotation on ${SITE_NAME}.`,
    path: canonicalProfilePath(supervisor, stateSlug),
    ogImage: supervisor.profilePhotoUrl ?? undefined,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PreceptorProfilePage({ params }: Props) {
  const { state: stateSlug, id } = await params
  const supervisor = await resolvePreceptor(stateSlug, id)
  const stateName = stateSlugToDisplayName(stateSlug)
  const profilePath = `${PRECEPTORS_PATH}/${stateSlug}/${id}`

  const jsonLd = generateSupervisorJsonLd({
    id,
    fullName: supervisor.fullName,
    // The preceptor's own state for the address; the URL state is only browse context.
    state: supervisor.state || stateSlugToAbbreviation(stateSlug),
    city: supervisor.city || null,
    licenseType: supervisor.licenseType || null,
    supervisorType: 'Preceptor',
    specialty: supervisor.specialty || null,
    bio: supervisor.bio || null,
    profilePhotoUrl: supervisor.profilePhotoUrl,
    profilePath: canonicalProfilePath(supervisor, stateSlug),
  })

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Preceptors', href: PRECEPTORS_PATH },
    { name: stateName, href: `${PRECEPTORS_PATH}/${stateSlug}` },
    { name: supervisor.fullName, href: profilePath },
  ]

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <SupervisorPublicProfile
          supervisor={supervisor}
          connectPath={`/find-preceptors/${id}`}
          signupHref="/signup?type=preceptee"
        />

        <div className="mt-10 border-t pt-8">
          <p className="text-sm font-semibold text-foreground">Find Preceptors in Other States</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOP_STATE_SLUGS.filter((s) => s !== stateSlug)
              .slice(0, 8)
              .map((slug) => (
                <Link
                  key={slug}
                  href={`${PRECEPTORS_PATH}/${slug}`}
                  className="rounded-md border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {stateSlugToDisplayName(slug)}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
