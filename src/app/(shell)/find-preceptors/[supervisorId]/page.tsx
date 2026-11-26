import { Suspense } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SupervisorProfilePage, SupervisorProfileSkeleton } from '@/components/SupervisorProfile'

interface PreceptorProfileRouteProps {
  params: Promise<{ supervisorId: string }>
}

export async function generateMetadata({ params }: PreceptorProfileRouteProps) {
  const { supervisorId: _ } = await params
  return {
    title: 'Preceptor Profile',
    description: "View this preceptor's credentials, availability, and rotation details.",
  }
}

export default async function PreceptorProfileRoute({ params }: PreceptorProfileRouteProps) {
  const { supervisorId } = await params

  return (
    <SuperviseeRouteGuard>
      <Suspense fallback={<SupervisorProfileSkeleton />}>
        <SupervisorProfilePage supervisorId={supervisorId} basePath="/find-preceptors" />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
