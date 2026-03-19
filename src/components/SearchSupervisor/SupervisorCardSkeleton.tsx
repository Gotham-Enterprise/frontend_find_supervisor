import { Skeleton } from '@/components/ui/skeleton'

export function SupervisorCardSkeleton() {
  return (
    <div className="flex gap-5 rounded-xl border border-border bg-card p-5">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-9 w-28 shrink-0" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}
