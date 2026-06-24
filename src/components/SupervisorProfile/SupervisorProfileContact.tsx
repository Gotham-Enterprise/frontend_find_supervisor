'use client'

import { MailIcon, PhoneIcon } from 'lucide-react'

import { isSuperviseeRole } from '@/lib/auth/roles'
import { useUser } from '@/lib/contexts/UserContext'
import { useCheckConnectionAvailability } from '@/lib/hooks/useConnections'
import { formatContactNumber } from '@/lib/utils/profile-formatters'
import { isAcceptedConnectionStatus, isApprovedHireStatus } from '@/lib/utils/supervision-status'
import type { SupervisorProfileData } from '@/types/supervisor-profile'

interface SupervisorProfileContactProps {
  profile: SupervisorProfileData
}

export function SupervisorProfileContact({ profile }: SupervisorProfileContactProps) {
  const { email, contactNumber } = profile.user
  const { user } = useUser()

  // Contact details are private by default. They're revealed only when the viewer
  // has an active relationship with this supervisor:
  //  - the supervisor accepted the hire/supervision request (ACCEPTED/ACTIVE), or
  //  - the supervisee already has an approved connection, or
  //  - the supervisor is viewing their own profile.
  const isOwner = !!user?.id && user.id === profile.user.id
  const isSupervisee = isSuperviseeRole(user?.role)
  const { data: connectionCheckData } = useCheckConnectionAvailability(
    isSupervisee ? (user?.id ?? null) : null,
    isSupervisee ? profile.user.email : null,
  )
  const isConnectionApproved = isAcceptedConnectionStatus(connectionCheckData?.reason)
  const isHireAccepted = isApprovedHireStatus(profile.hiredInfo?.status)

  const canViewContact = isOwner || isConnectionApproved || isHireAccepted

  if (!canViewContact) return null
  if (!email && !contactNumber) return null

  return (
    <section className="border-b border-[#E5E7EB] py-8">
      <h2 className="mb-4 text-base font-semibold text-[#181818]">Contact</h2>
      <div className="flex flex-col gap-2 text-sm text-[#374151]">
        {email && (
          <div className="flex items-center gap-2">
            <MailIcon className="size-4 shrink-0 text-[#6B7280]" />
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
          </div>
        )}
        {contactNumber && (
          <div className="flex items-center gap-2">
            <PhoneIcon className="size-4 shrink-0 text-[#6B7280]" />
            <span>{formatContactNumber(contactNumber)}</span>
          </div>
        )}
      </div>
    </section>
  )
}
