import { redirect } from 'next/navigation'

interface UserRoutePageProps {
  params: Promise<{ userId: string }>
}

/** Permanent redirect — /user/[id] is superseded by /supervisors/[id]. */
export default async function UserRoutePage({ params }: UserRoutePageProps) {
  const { userId } = await params
  redirect(`/supervisors/${userId}`)
}
