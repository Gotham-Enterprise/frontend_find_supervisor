import { Suspense } from 'react'

import { HiredSupervisorsPage } from '@/components/HiredSupervisors'

export const metadata = {
  title: 'Hired Preceptors',
  description: 'Your preceptors and rotation request details.',
}

export default function HiredPreceptorsRoutePage() {
  // Suspense: the hire cards read ?hire=<id> via useSearchParams (agreement deep links)
  return (
    <Suspense fallback={null}>
      <HiredSupervisorsPage mode="preceptors" />
    </Suspense>
  )
}
