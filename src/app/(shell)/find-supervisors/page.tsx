import { Suspense } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SearchSupervisorPage } from '@/components/SearchSupervisor'

export const metadata = {
  title: 'Find Your Supervisor | Find A Supervisor',
  description: 'Browse verified Supervisors matched to your specialty, license, and goals.',
}

export default function FindSupervisorsRoutePage() {
  return (
    <SuperviseeRouteGuard>
      {/* useSearchParams (filter state in the URL) requires a Suspense boundary */}
      <Suspense>
        <SearchSupervisorPage />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
