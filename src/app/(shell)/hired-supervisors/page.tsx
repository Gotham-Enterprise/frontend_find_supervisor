import { Suspense } from 'react'

import { HiredSupervisorsPage } from '@/components/HiredSupervisors'

export default function HiredSupervisorsRoutePage() {
  // Suspense: the hire cards read ?hire=<id> via useSearchParams (agreement deep links)
  return (
    <Suspense fallback={null}>
      <HiredSupervisorsPage />
    </Suspense>
  )
}
