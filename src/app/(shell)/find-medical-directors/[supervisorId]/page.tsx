import { Suspense } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SupervisorProfilePage, SupervisorProfileSkeleton } from '@/components/SupervisorProfile'

interface MedicalDirectorProfileRouteProps {
  params: Promise<{ supervisorId: string }>
}

export async function generateMetadata({ params }: MedicalDirectorProfileRouteProps) {
  const { supervisorId: _ } = await params
  return {
    title: 'Medical Director Profile | Find A Supervisor',
    description: "View this medical director's credentials, availability, and service details.",
  }
}

export default async function MedicalDirectorProfileRoute({
  params,
}: MedicalDirectorProfileRouteProps) {
  const { supervisorId } = await params

  return (
    <SuperviseeRouteGuard>
      <Suspense fallback={<SupervisorProfileSkeleton />}>
        <SupervisorProfilePage supervisorId={supervisorId} basePath="/find-medical-directors" />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
