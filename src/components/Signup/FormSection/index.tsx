import * as React from 'react'

import { cn } from '@/lib/utils'

type FormSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <div className="h-4 w-0.5 rounded-full bg-primary" />
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}
