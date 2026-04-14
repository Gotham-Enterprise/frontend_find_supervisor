import { redirect } from 'next/navigation'

interface UserRoutePageProps {
  params: Promise<{ userId: string }>
}

/** Permanent redirect — /user/[id] is superseded by /find-supervisors/[id]. */
export default async function UserRoutePage({ params }: UserRoutePageProps) {
  const { userId } = await params
  redirect(`/find-supervisors/${userId}`)
}
