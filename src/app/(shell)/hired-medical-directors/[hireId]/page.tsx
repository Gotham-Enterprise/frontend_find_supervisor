import { Suspense } from 'react'

import { HireWorkroomPage } from '@/components/HireWorkroom'
import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'

interface MedicalDirectorWorkroomRouteProps {
  params: Promise<{ hireId: string }>
}

export const metadata = {
  title: 'Workroom | Find A Supervisor',
  description:
    'Your supervision with this medical director: overview, billing, messages, and contract details.',
}

export default async function MedicalDirectorWorkroomRoute({
  params,
}: MedicalDirectorWorkroomRouteProps) {
  const { hireId } = await params

  // Suspense: the workroom reads ?tab= via useSearchParams.
  return (
    <SuperviseeRouteGuard>
      <Suspense fallback={null}>
        <HireWorkroomPage hireId={hireId} listPath="/hired-medical-directors" />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
