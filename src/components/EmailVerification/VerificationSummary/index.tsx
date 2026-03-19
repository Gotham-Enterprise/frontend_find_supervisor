import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import type { VerificationPageData } from '../types'

interface Props {
  data: VerificationPageData
}

export function VerificationSummary({ data }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-muted-foreground">Full Name</span>
        <span className="text-sm font-semibold text-foreground">{data.fullName}</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-muted-foreground">Email Address</span>
        <span className="text-sm font-semibold text-foreground">{data.email}</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-muted-foreground">Account Role</span>
        <Badge className="rounded-full border border-[#006D36]/25 bg-[#006D36]/10 px-2.5 text-[#006D36] hover:bg-[#006D36]/10">
          {data.role}
        </Badge>
      </div>
    </div>
  )
}
