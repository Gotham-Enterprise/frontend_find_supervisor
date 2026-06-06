import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'
import { SearchSuperviseePage } from '@/components/SearchSupervisee'

export const metadata = {
  title: 'Find Supervisees | Find A Supervisor',
  description:
    'Browse supervisees looking for supervision matched to your specialty and licensure.',
}

export default function FindSuperviseesRoutePage() {
  return (
    <SupervisorRouteGuard>
      <SearchSuperviseePage />
    </SupervisorRouteGuard>
  )
}
