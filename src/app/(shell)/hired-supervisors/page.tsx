import { Suspense } from 'react'

import { HiredSupervisorsPage } from '@/components/HiredSupervisors'

export default function HiredSupervisorsRoutePage() {
  // Suspense: the page reads old ?hire= / ?sessions= / ?billing= links via useSearchParams
  return (
    <Suspense fallback={null}>
      <HiredSupervisorsPage />
    </Suspense>
  )
}
