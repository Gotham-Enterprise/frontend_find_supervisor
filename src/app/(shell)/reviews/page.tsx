import { SupervisorRouteGuard } from '@/components/Layout/SupervisorRouteGuard'
import { SupervisorReviewsPage } from '@/components/SupervisorReviews'

export const metadata = {
  title: 'My Reviews | Find A Supervisor',
  description: 'View feedback and ratings submitted by your supervisees.',
}

export default function ReviewsRoutePage() {
  return (
    <SupervisorRouteGuard>
      <SupervisorReviewsPage />
    </SupervisorRouteGuard>
  )
}
