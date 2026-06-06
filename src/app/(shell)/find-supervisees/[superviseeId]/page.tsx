import { Suspense } from 'react'

import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'
import { SuperviseeProfilePage, SuperviseeProfileSkeleton } from '@/components/SuperviseeProfile'

interface SuperviseeProfileRouteProps {
  params: Promise<{ superviseeId: string }>
}

export async function generateMetadata({ params }: SuperviseeProfileRouteProps) {
  const { superviseeId: _ } = await params
  return {
    title: 'Supervisee Profile | Find A Supervisor',
    description: "View this supervisee's supervision needs, credentials, and availability.",
  }
}

export default async function SuperviseeProfileRoute({ params }: SuperviseeProfileRouteProps) {
  const { superviseeId } = await params

  return (
    <SupervisorRouteGuard>
      <Suspense fallback={<SuperviseeProfileSkeleton />}>
        <SuperviseeProfilePage superviseeId={superviseeId} />
      </Suspense>
    </SupervisorRouteGuard>
  )
}
