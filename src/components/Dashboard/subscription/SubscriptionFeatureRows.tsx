import { CheckCircle2, Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export function FreeFeatureRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <CheckCircle2 className="size-4 shrink-0 text-primary" />
      <span className="text-sm text-foreground">{label}</span>
    </li>
  )
}

export function LockedFeatureRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <div className="flex size-4 shrink-0 items-center justify-center rounded border border-border bg-muted">
        <Lock className="size-2.5 text-muted-foreground" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge className="ml-auto shrink-0 bg-amber-100 px-1.5 py-0 text-[10px] font-medium text-amber-700 hover:bg-amber-100">
        Premium
      </Badge>
    </li>
  )
}

export function PremiumFeaturesDivider({ label = 'Premium Features' }: { label?: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
