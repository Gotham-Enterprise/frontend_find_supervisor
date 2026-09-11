'use client'

import {
  Briefcase,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Link2,
  MessageCircle,
  Settings,
  Star,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { isSuperviseeRole } from '@/lib/auth/roles'
import { usePendingRequestsCount, useUser } from '@/lib/hooks'
import { useConversations } from '@/lib/hooks/useChat'
import { useSuperviseeProfile } from '@/lib/hooks/useSuperviseeProfile'
import { useSupervisorProfile } from '@/lib/hooks/useSupervisorProfile'
import { cn } from '@/lib/utils'
import { MEDICAL_DIRECTOR_TYPE_NAME } from '@/lib/utils/supervisee-eligibility'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  // Which find pages show depends on the supervisee's stored supervision needs
  {
    label: 'Find Supervisors',
    href: '/find-supervisors',
    icon: Users,
    superviseeOnly: true,
    requiresNonMdNeed: true,
  },
  {
    label: 'Find Medical Directors',
    href: '/find-medical-directors',
    icon: Stethoscope,
    superviseeOnly: true,
    requiresMdNeed: true,
  },
  {
    label: 'Hired Supervisors',
    href: '/hired-supervisors',
    icon: Briefcase,
    superviseeOnly: true,
    requiresNonMdNeed: true,
  },
  {
    label: 'Hired Medical Directors',
    href: '/hired-medical-directors',
    icon: Briefcase,
    superviseeOnly: true,
    requiresMdNeed: true,
  },
  { label: 'Find Supervisees', href: '/find-supervisees', icon: Users, supervisorOnly: true },
  {
    label: 'My Supervisees',
    href: '/supervisees',
    icon: UserCheck,
    supervisorOnly: true,
    // Hidden for a plain Medical Director (no supervision offerings)
    requiresSupervisionRole: true,
  },
  {
    label: 'Medical Director Clients',
    href: '/medical-director-clients',
    icon: UserCheck,
    supervisorOnly: true,
    requiresMdRole: true,
  },
  {
    label: 'Supervision Requests',
    href: '/supervision-requests',
    icon: ClipboardList,
    supervisorOnly: true,
  },
  {
    label: 'Sent Connections',
    href: '/connections/sent',
    icon: Link2,
    supervisorOnly: true,
  },
  {
    label: 'Connection Requests',
    href: '/connections/received',
    icon: Link2,
    superviseeOnly: true,
  },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Reviews', href: '/reviews', icon: Star, supervisorOnly: true },
  { label: 'Billing & Invoices', href: '/billing', icon: CreditCard, supervisorOnly: true },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const isSupervisee = user ? isSuperviseeRole(user.role) : false
  const { data: pendingCount } = usePendingRequestsCount(!isSuperviseeRole(user?.role))
  const { data: conversations = [] } = useConversations()
  const totalUnreadMessages = conversations.filter((c) => (c.unreadCount ?? 0) > 0).length

  // Supervision needs decide which find pages appear. While the profile is
  // still loading, keep the pre-existing default (Find Supervisors only).
  const { data: superviseeProfile, isFetched: superviseeProfileFetched } =
    useSuperviseeProfile(isSupervisee)
  const needs = (superviseeProfile?.typeOfSupervisorNeeded ?? []).map((need) => need.trim())
  const hasMdNeed = superviseeProfileFetched && needs.includes(MEDICAL_DIRECTOR_TYPE_NAME)
  // Legacy profiles without stored needs keep the unrestricted supervisor search.
  const hasNonMdNeed =
    !superviseeProfileFetched ||
    needs.length === 0 ||
    needs.some((need) => need && need !== MEDICAL_DIRECTOR_TYPE_NAME)

  // Supervisor role split: Medical Director Clients is a separate list from
  // My Supervisees. While the profile loads, keep the pre-existing default
  // (My Supervisees visible, MD Clients hidden).
  const isSupervisorRole = user ? !isSuperviseeRole(user.role) : false
  const { data: supervisorProfile, isFetched: supervisorProfileFetched } =
    useSupervisorProfile(isSupervisorRole)
  const isMdSupervisor =
    supervisorProfileFetched && supervisorProfile?.supervisorType === MEDICAL_DIRECTOR_TYPE_NAME
  const providesSupervision =
    !supervisorProfileFetched ||
    supervisorProfile?.supervisorType !== MEDICAL_DIRECTOR_TYPE_NAME ||
    (supervisorProfile?.offerings?.length ?? 0) > 0

  const visibleNavItems = navItems.filter((item) => {
    if ('superviseeOnly' in item && item.superviseeOnly && !isSupervisee) {
      return false
    }
    if ('requiresMdRole' in item && item.requiresMdRole) {
      return isSupervisorRole && isMdSupervisor
    }
    if ('requiresSupervisionRole' in item && item.requiresSupervisionRole) {
      return isSupervisorRole && providesSupervision
    }
    if ('supervisorOnly' in item && item.supervisorOnly) {
      return user ? !isSuperviseeRole(user.role) : false
    }
    if ('requiresMdNeed' in item && item.requiresMdNeed) {
      return hasMdNeed
    }
    if ('requiresNonMdNeed' in item && item.requiresNonMdNeed) {
      return hasNonMdNeed
    }
    return true
  })

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-white">
      <a
        href="https://www.gothamenterprisesltd.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[60px] shrink-0 items-center border-b border-border px-6"
      >
        <Image
          src="/logo.png"
          alt="Gotham Enterprises LTD"
          width={120}
          height={32}
          className="h-8 w-auto"
        />
      </a>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {visibleNavItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const badge =
            href === '/supervision-requests' && pendingCount && pendingCount > 0
              ? pendingCount
              : href === '/messages' && totalUnreadMessages > 0
                ? totalUnreadMessages
                : null

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-light text-primary font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge !== null && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
