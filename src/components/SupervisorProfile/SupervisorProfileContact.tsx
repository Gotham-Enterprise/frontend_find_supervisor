import { PhoneIcon } from 'lucide-react'

import { formatContactNumber } from '@/lib/utils/profile-formatters'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileContactProps {
  profile: SupervisorProfileData
}

export function SupervisorProfileContact({ profile }: SupervisorProfileContactProps) {
  const { contactNumber } = profile.user

  if (!contactNumber) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">Contact</h2>
      <div className="flex items-center gap-2 text-sm text-[#374151]">
        <PhoneIcon className="size-4 shrink-0 text-[#6B7280]" />
        <span>{formatContactNumber(contactNumber)}</span>
      </div>
    </section>
  )
}
