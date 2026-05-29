import { Skeleton } from '@/components/ui/skeleton'

export function SuperviseeProfileSkeleton() {
  return (
    <div className="min-h-full bg-white px-6 pt-6 pb-12">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-4 w-40" />

        <div className="flex flex-col gap-6 border-b border-[#E5E7EB] py-8 sm:flex-row">
          <Skeleton className="size-[88px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>

        <div className="space-y-3 border-b border-[#E5E7EB] py-8">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>

        <div className="space-y-3 border-b border-[#E5E7EB] py-8">
          <Skeleton className="h-5 w-48" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-[#F3F4F6] py-3 last:border-0"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <div className="space-y-3 border-b border-[#E5E7EB] py-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
