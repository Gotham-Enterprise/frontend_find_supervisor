import { SentConnectionsPage } from '@/components/Connections/SentConnectionsPage'
import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'

export const metadata = {
  title: 'Sent Connections | Find A Supervisor',
  description: 'View and manage the connection requests you have sent to supervisees.',
}

export default function SentConnectionsRoutePage() {
  return (
    <SupervisorRouteGuard>
      <SentConnectionsPage />
    </SupervisorRouteGuard>
  )
}
