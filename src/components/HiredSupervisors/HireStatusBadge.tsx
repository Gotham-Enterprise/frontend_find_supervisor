import { Badge } from '@/components/ui/badge'
import type { HireStatus } from '@/types/hire'

const STATUS_CONFIG: Record<HireStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  ACCEPTED: { label: 'Accepted', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
  CANCELED: { label: 'Canceled', className: 'bg-red-100 text-red-600 hover:bg-red-100' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-600 hover:bg-red-100' },
}

interface HireStatusBadgeProps {
  status: HireStatus
}

export function HireStatusBadge({ status }: HireStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
