import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SupervisorProfilePage } from '@/components/SupervisorProfile'

interface SupervisorProfileRouteProps {
  params: Promise<{ supervisorId: string }>
}

export async function generateMetadata({ params }: SupervisorProfileRouteProps) {
  const { supervisorId: _ } = await params
  return {
    title: 'Supervisor Profile | Find A Supervisor',
    description: "View this supervisor's credentials, availability, and supervision details.",
  }
}

export default async function SupervisorProfileRoute({ params }: SupervisorProfileRouteProps) {
  const { supervisorId } = await params

  return (
    <SuperviseeRouteGuard>
      <SupervisorProfilePage supervisorId={supervisorId} />
    </SuperviseeRouteGuard>
  )
}
