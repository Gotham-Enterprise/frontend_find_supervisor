import { ReceivedConnectionsPage } from '@/components/Connections/ReceivedConnectionsPage'
import { SuperviseeRouteGuard } from '@/components/Layout/SuperviseeRouteGuard'

export const metadata = {
  title: 'Connection Requests | Find A Supervisor',
  description: 'Review and manage connection requests from supervisors.',
}

export default function ReceivedConnectionsRoutePage() {
  return (
    <SuperviseeRouteGuard>
      <ReceivedConnectionsPage />
    </SuperviseeRouteGuard>
  )
}
