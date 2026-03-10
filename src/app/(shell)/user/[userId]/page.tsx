import { UserPage } from '@/components/User'

interface UserRoutePageProps {
  params: Promise<{ userId: string }>
}

export default async function UserRoutePage({ params }: UserRoutePageProps) {
  const { userId } = await params
  return <UserPage userId={userId} />
}
