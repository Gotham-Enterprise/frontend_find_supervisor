'use client'

import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'
import { VerificationGuide } from '@/components/VerificationGuide'

export default function VerificationGuidePage() {
  return (
    <SupervisorRouteGuard>
      <VerificationGuide />
    </SupervisorRouteGuard>
  )
}
