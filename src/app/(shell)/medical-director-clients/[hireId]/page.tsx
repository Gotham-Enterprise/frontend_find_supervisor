import { Suspense } from 'react'

import { ClientWorkroomPage } from '@/components/HireWorkroom/ClientWorkroom'
import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'

interface ClientWorkroomRouteProps {
  params: Promise<{ hireId: string }>
}

export const metadata = {
  title: 'Client Workroom | Find A Supervisor',
  description:
    'Your engagement with this client: what needs doing, monthly billing, activity log, messages, and the contract.',
}

export default async function ClientWorkroomRoute({ params }: ClientWorkroomRouteProps) {
  const { hireId } = await params

  // Suspense: the workroom reads ?tab= via useSearchParams.
  return (
    <SupervisorRouteGuard>
      <Suspense fallback={null}>
        <ClientWorkroomPage hireId={hireId} />
      </Suspense>
    </SupervisorRouteGuard>
  )
}
