import type { LucideIcon } from 'lucide-react'
import { BookOpen, CalendarDays, MessageCircle, Search, UserCheck } from 'lucide-react'

export interface SuperviseeDashboardQuickActionItem {
  icon: LucideIcon
  label: string
  description: string
  href: string
  linkText: string
}

export const SUPERVISEE_DASHBOARD_QUICK_ACTIONS: SuperviseeDashboardQuickActionItem[] = [
  {
    icon: Search,
    label: 'Find a Supervisor',
    description: 'Browse verified supervisors',
    href: '/find-supervisors',
    linkText: 'Browse now →',
  },
  {
    icon: CalendarDays,
    label: 'Book a Session',
    description: 'Schedule with your supervisor',
    href: '/sessions',
    linkText: 'Book now →',
  },
  {
    icon: UserCheck,
    label: 'Complete Profile',
    description: 'Fill in missing details',
    href: '/profile',
    linkText: 'Go to profile →',
  },
  {
    icon: MessageCircle,
    label: 'View Messages',
    description: 'Check your conversations',
    href: '/messages',
    linkText: 'Open inbox →',
  },
  {
    icon: BookOpen,
    label: 'My Sessions',
    description: 'View session history',
    href: '/sessions',
    linkText: 'View all →',
  },
]
