import { Suspense } from 'react'

import { HiredSupervisorsPage } from '@/components/HiredSupervisors'

export const metadata = {
  title: 'Hired Medical Directors | Find A Supervisor',
  description: 'Your hired medical directors and engagement details.',
}

export default function HiredMedicalDirectorsRoutePage() {
  // Suspense: the page reads old ?hire= / ?sessions= / ?billing= links via useSearchParams
  return (
    <Suspense fallback={null}>
      <HiredSupervisorsPage mode="medical-directors" />
    </Suspense>
  )
}
