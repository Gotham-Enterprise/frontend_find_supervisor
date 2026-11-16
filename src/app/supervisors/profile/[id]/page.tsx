/**
 * Thin resolver for /supervisors/profile/[id].
 *
 * SupervisorCard links here only when it cannot derive a state slug. This
 * route looks the supervisor up and permanently redirects to the canonical
 * /supervisors/[stateSlug]/[id] profile URL (see profileStateSlug); Medical
 * Directors go to /medical-directors/[stateSlug]/[id]. Unknown supervisors
 * (or ones with no resolvable state at all) 404.
 */

import { notFound, permanentRedirect } from 'next/navigation'

import { fetchPublicSupervisorById, publicDirectoryFor } from '@/lib/api/public-supervisors'
import { profileStateSlug } from '@/lib/seo/routes'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SupervisorProfileRedirect({ params }: Props) {
  const { id } = await params

  const supervisor = await fetchPublicSupervisorById(id)
  if (!supervisor) notFound()

  const stateSlug = profileStateSlug(supervisor.state, supervisor.stateOfLicensure)

  if (!stateSlug) notFound()

  // Primary Medical Directors resolve straight to /medical-directors (no double hop).
  permanentRedirect(`${publicDirectoryFor(supervisor)}/${stateSlug}/${id}`)
}
