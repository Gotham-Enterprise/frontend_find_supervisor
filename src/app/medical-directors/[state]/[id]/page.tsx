/**
 * Public Medical Director profile — /medical-directors/[state]/[id]
 * e.g. /medical-directors/california/46e0579d-ec2f-4893-8277-7e4e6220757d
 *
 * Only primary Medical Directors render here; any other supervisor permanently
 * redirects to its canonical /supervisors/[state]/[id] URL. Unknown or hidden
 * profiles 404. Rendered on demand with ISR (public-profile fetch revalidates
 * hourly).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { SupervisorPublicProfile } from '@/components/seo/SupervisorPublicProfile'
import {
  fetchPublicSupervisorById,
  isPublicMedicalDirector,
  type PublicSupervisorSummary,
} from '@/lib/api/public-supervisors'
import { buildMetadata, SITE_NAME } from '@/lib/seo/config'
import { generateSupervisorJsonLd } from '@/lib/seo/jsonld'
import {
  isUUID,
  isValidStateSlug,
  MEDICAL_DIRECTORS_PATH,
  stateSlugToAbbreviation,
  stateSlugToDisplayName,
  TOP_STATE_SLUGS,
} from '@/lib/seo/routes'

interface Props {
  params: Promise<{ state: string; id: string }>
}

export const dynamicParams = true

/**
 * Resolves the Medical Director for this URL — 404 for invalid params or
 * unknown profiles, permanent redirect for non-MD supervisors.
 */
async function resolveMedicalDirector(
  stateSlug: string,
  id: string,
): Promise<PublicSupervisorSummary> {
  if (!isValidStateSlug(stateSlug) || !isUUID(id)) notFound()

  const supervisor = await fetchPublicSupervisorById(id)
  if (!supervisor) notFound()

  if (!isPublicMedicalDirector(supervisor)) {
    permanentRedirect(`/supervisors/${stateSlug}/${id}`)
  }

  return supervisor
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, id } = await params
  const supervisor = await resolveMedicalDirector(stateSlug, id)
  const stateName = stateSlugToDisplayName(stateSlug)
  const specialty = supervisor.specialty ? `${supervisor.specialty} ` : ''

  return buildMetadata({
    title: `${supervisor.fullName}, Medical Director in ${stateName}`,
    description: `View ${supervisor.fullName}'s ${specialty}Medical Director profile, including licensed states, board certifications, format, monthly fee, and professional background. Connect with verified Medical Directors on ${SITE_NAME}.`,
    path: `${MEDICAL_DIRECTORS_PATH}/${stateSlug}/${id}`,
    ogImage: supervisor.profilePhotoUrl ?? undefined,
  })
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function MedicalDirectorProfilePage({ params }: Props) {
  const { state: stateSlug, id } = await params
  const supervisor = await resolveMedicalDirector(stateSlug, id)
  const stateName = stateSlugToDisplayName(stateSlug)
  const profilePath = `${MEDICAL_DIRECTORS_PATH}/${stateSlug}/${id}`

  const jsonLd = generateSupervisorJsonLd({
    id,
    fullName: supervisor.fullName,
    state: stateSlugToAbbreviation(stateSlug),
    city: supervisor.city || null,
    licenseType: supervisor.licenseType || null,
    supervisorType: 'Medical Director',
    specialty: supervisor.specialty || null,
    bio: supervisor.bio || null,
    profilePhotoUrl: supervisor.profilePhotoUrl,
    profilePath,
    boardCertifications: supervisor.boardCertifications,
  })

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Medical Directors', href: MEDICAL_DIRECTORS_PATH },
    { name: stateName, href: `${MEDICAL_DIRECTORS_PATH}/${stateSlug}` },
    { name: supervisor.fullName, href: profilePath },
  ]

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        <SupervisorPublicProfile
          supervisor={supervisor}
          connectPath={`/find-medical-directors/${id}`}
          signupHref="/signup?type=need-medical-director"
        />

        <div className="mt-10 border-t pt-8">
          <p className="text-sm font-semibold text-foreground">
            Find Medical Directors in Other States
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOP_STATE_SLUGS.filter((s) => s !== stateSlug)
              .slice(0, 8)
              .map((slug) => (
                <Link
                  key={slug}
                  href={`${MEDICAL_DIRECTORS_PATH}/${slug}`}
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
