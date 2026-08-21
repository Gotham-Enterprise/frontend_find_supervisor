import { HiredSupervisorsPage } from '@/components/HiredSupervisors'

export const metadata = {
  title: 'Hired Medical Directors | Find A Supervisor',
  description: 'Your hired medical directors and engagement details.',
}

export default function HiredMedicalDirectorsRoutePage() {
  return <HiredSupervisorsPage mode="medical-directors" />
}
