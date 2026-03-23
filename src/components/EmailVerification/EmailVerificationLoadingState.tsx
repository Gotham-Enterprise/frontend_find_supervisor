'use client'

import { Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export function EmailVerificationLoadingState() {
  return (
    <Card className="w-full max-w-[560px] shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 px-6 py-16 sm:px-10">
        <Loader2 className="h-10 w-10 animate-spin text-[#006D36]" strokeWidth={1.5} />
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-foreground">Verifying your email…</p>
          <p className="text-xs text-muted-foreground">This only takes a moment.</p>
        </div>
      </CardContent>
    </Card>
  )
}
