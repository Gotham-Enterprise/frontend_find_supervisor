import { Suspense } from 'react'

import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'
import { SupervisionRequestsPage } from '@/components/SupervisionRequests'

export const metadata = {
  title: 'Supervision Requests | Find A Supervisor',
  description: 'Review and manage supervisees who have requested supervision from you.',
}

export default function SupervisionRequestsRoutePage() {
  // Suspense: the page reads ?accept=<hireId> via useSearchParams (resume after checkout)
  return (
    <SupervisorRouteGuard>
      <Suspense fallback={null}>
        <SupervisionRequestsPage />
      </Suspense>
    </SupervisorRouteGuard>
  )
}
