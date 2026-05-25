'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useTermsAndPrivacyPolicy } from '@/lib/hooks'

function TermsOfServiceSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 md:px-0">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TermsOfService() {
  const { data, isLoading } = useTermsAndPrivacyPolicy()

  const content = data?.data?.terms?.content

  if (isLoading) return <TermsOfServiceSkeleton />

  return (
    <div
      className="
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground
        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2
        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground
        [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground/80
        [&_b]:font-semibold [&_b]:text-foreground
        [&_i]:text-foreground/70
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1
        [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-foreground/80
        [&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary/80
      "
      dangerouslySetInnerHTML={{ __html: content ?? '' }}
    />
  )
}
