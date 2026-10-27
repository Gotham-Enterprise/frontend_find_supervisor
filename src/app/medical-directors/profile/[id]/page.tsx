/**
 * Thin resolver for /medical-directors/profile/[id].
 *
 * SupervisorCard links here only when it cannot derive a state slug from the
 * Medical Director's home state. This route looks the profile up and
 * permanently redirects to the canonical profile URL, trying the home state
 * first and then each state of licensure. Non-MD profiles resolve to
 * /supervisors instead. Unknown profiles (or ones with no resolvable state
 * at all) 404.
 */

import { notFound, permanentRedirect } from 'next/navigation'

import { fetchPublicSupervisorById, publicDirectoryFor } from '@/lib/api/public-supervisors'
import { stateAbbreviationToSlug } from '@/lib/seo/routes'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MedicalDirectorProfileRedirect({ params }: Props) {
  const { id } = await params

  const supervisor = await fetchPublicSupervisorById(id)
  if (!supervisor) notFound()

  const stateSlug =
    stateAbbreviationToSlug(supervisor.state) ??
    supervisor.stateOfLicensure.map(stateAbbreviationToSlug).find(Boolean)

  if (!stateSlug) notFound()

  permanentRedirect(`${publicDirectoryFor(supervisor)}/${stateSlug}/${id}`)
}
