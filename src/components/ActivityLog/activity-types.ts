import {
  ClipboardList,
  FileCheck2,
  type LucideIcon,
  MessageCircleQuestion,
  NotebookPen,
  Users,
} from 'lucide-react'

import type { ActivityType } from '@/types/activity-log'

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  MEETING: 'Meeting or call',
  CHART_REVIEW: 'Chart review',
  PROTOCOL_REVIEW: 'Protocols & standing orders',
  CONSULTATION: 'Consultation',
  OTHER: 'Other',
}

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, LucideIcon> = {
  MEETING: Users,
  CHART_REVIEW: ClipboardList,
  PROTOCOL_REVIEW: FileCheck2,
  CONSULTATION: MessageCircleQuestion,
  OTHER: NotebookPen,
}
