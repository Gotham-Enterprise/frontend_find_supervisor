import { MailIcon, PhoneIcon } from 'lucide-react'

import { formatContactNumber } from '@/lib/utils/profile-formatters'
import type { SuperviseeProfileViewData } from '@/types/supervisee-profile'

interface SuperviseeProfileContactProps {
  profile: SuperviseeProfileViewData
}

export function SuperviseeProfileContact({ profile }: SuperviseeProfileContactProps) {
  const { email, contactNumber } = profile.user

  if (!email && !contactNumber) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">Contact</h2>
      <div className="space-y-3">
        {email && (
          <div className="flex items-center gap-2 text-sm text-[#374151]">
            <MailIcon className="size-4 shrink-0 text-[#6B7280]" />
            <a href={`mailto:${email}`} className="text-[#006D36] hover:underline">
              {email}
            </a>
          </div>
        )}
        {contactNumber && (
          <div className="flex items-center gap-2 text-sm text-[#374151]">
            <PhoneIcon className="size-4 shrink-0 text-[#6B7280]" />
            <span>{formatContactNumber(contactNumber)}</span>
          </div>
        )}
      </div>
    </section>
  )
}
