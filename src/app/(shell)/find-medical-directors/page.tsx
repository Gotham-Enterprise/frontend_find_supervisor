import { Suspense } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SearchSupervisorPage } from '@/components/SearchSupervisor'

export const metadata = {
  title: 'Find Medical Directors | Find A Supervisor',
  description: 'Browse verified medical directors for your practice.',
}

export default function FindMedicalDirectorsRoutePage() {
  return (
    <SuperviseeRouteGuard>
      {/* useSearchParams (filter state in the URL) requires a Suspense boundary */}
      <Suspense>
        <SearchSupervisorPage mode="medical-directors" />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
