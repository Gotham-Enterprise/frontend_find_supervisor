/**
 * Thin resolver for /supervisors/profile/[id].
 *
 * SupervisorCard links here only when it cannot derive a state slug from the
 * supervisor's home state. This route looks the supervisor up and permanently
 * redirects to the canonical /supervisors/[stateSlug]/[id] profile URL, trying
 * the home state first and then each state of licensure (Medical Directors go
 * to /medical-directors/[stateSlug]/[id]). Unknown supervisors
 * (or ones with no resolvable state at all) 404.
 */

import { notFound, permanentRedirect } from 'next/navigation'

import { fetchPublicSupervisorById, publicDirectoryFor } from '@/lib/api/public-supervisors'
import { stateAbbreviationToSlug } from '@/lib/seo/routes'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SupervisorProfileRedirect({ params }: Props) {
  const { id } = await params

  const supervisor = await fetchPublicSupervisorById(id)
  if (!supervisor) notFound()

  const stateSlug =
    stateAbbreviationToSlug(supervisor.state) ??
    supervisor.stateOfLicensure.map(stateAbbreviationToSlug).find(Boolean)

  if (!stateSlug) notFound()

  // Primary Medical Directors resolve straight to /medical-directors (no double hop).
  permanentRedirect(`${publicDirectoryFor(supervisor)}/${stateSlug}/${id}`)
}
