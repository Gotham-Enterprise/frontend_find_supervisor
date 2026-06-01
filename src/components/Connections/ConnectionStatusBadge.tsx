import { Badge } from '@/components/ui/badge'
import type { ConnectionStatus } from '@/types/connections'

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  APPROVED: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  },
  DECLINED: { label: 'Declined', className: 'bg-red-100 text-red-600 hover:bg-red-100' },
  CANCELED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 hover:bg-gray-100' },
}

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
