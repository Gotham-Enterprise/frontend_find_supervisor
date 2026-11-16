/**
 * Thin resolver for /medical-directors/profile/[id].
 *
 * SupervisorCard links here only when it cannot derive a state slug. This
 * route looks the profile up and permanently redirects to the canonical
 * profile URL (see profileStateSlug). Non-MD profiles resolve to
 * /supervisors instead. Unknown profiles (or ones with no resolvable state
 * at all) 404.
 */

import { notFound, permanentRedirect } from 'next/navigation'

import { fetchPublicSupervisorById, publicDirectoryFor } from '@/lib/api/public-supervisors'
import { profileStateSlug } from '@/lib/seo/routes'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MedicalDirectorProfileRedirect({ params }: Props) {
  const { id } = await params

  const supervisor = await fetchPublicSupervisorById(id)
  if (!supervisor) notFound()

  const stateSlug = profileStateSlug(supervisor.state, supervisor.stateOfLicensure)

  if (!stateSlug) notFound()

  permanentRedirect(`${publicDirectoryFor(supervisor)}/${stateSlug}/${id}`)
}
