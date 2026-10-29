import { Suspense } from 'react'

import { HireWorkroomPage } from '@/components/HireWorkroom'
import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'

interface HireWorkroomRouteProps {
  params: Promise<{ hireId: string }>
}

export const metadata = {
  title: 'Workroom | Find A Supervisor',
  description:
    'Your supervision with this supervisor: overview, timesheet, messages, and contract details.',
}

export default async function HireWorkroomRoute({ params }: HireWorkroomRouteProps) {
  const { hireId } = await params

  // Suspense: the workroom reads ?tab= and ?week= via useSearchParams.
  return (
    <SuperviseeRouteGuard>
      <Suspense fallback={null}>
        <HireWorkroomPage hireId={hireId} />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
