import { SuperviseesPage } from '@/components/Supervisees'

export const metadata = {
  title: 'My Preceptees',
  description: 'Students who requested a rotation with you.',
}

export default function PrecepteesRoutePage() {
  return <SuperviseesPage mode="preceptors" />
}
