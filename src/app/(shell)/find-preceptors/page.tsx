import { Suspense } from 'react'

import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SearchSupervisorPage } from '@/components/SearchSupervisor'

export const metadata = {
  title: 'Find Preceptors',
  description: 'Browse verified preceptors who can host your clinical rotation.',
}

export default function FindPreceptorsRoutePage() {
  return (
    <SuperviseeRouteGuard>
      {/* useSearchParams (filter state in the URL) requires a Suspense boundary */}
      <Suspense>
        <SearchSupervisorPage mode="preceptors" />
      </Suspense>
    </SuperviseeRouteGuard>
  )
}
