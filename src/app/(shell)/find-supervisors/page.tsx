import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'
import { SearchSupervisorPage } from '@/components/SearchSupervisor'

export const metadata = {
  title: 'Find Your Supervisor | Find A Supervisor',
  description: 'Browse verified supervisors matched to your specialty, license, and goals.',
}

export default function FindSupervisorsRoutePage() {
  return (
    <SuperviseeRouteGuard>
      <SearchSupervisorPage />
    </SuperviseeRouteGuard>
  )
}
