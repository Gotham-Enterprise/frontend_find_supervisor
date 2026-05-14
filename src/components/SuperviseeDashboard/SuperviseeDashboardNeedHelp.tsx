import { ChevronRight, Mail } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SuperviseeDashboardNeedHelp() {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Need help?</CardTitle>
        <p className="text-sm text-muted-foreground">Reach out if you have questions</p>
      </CardHeader>
      <CardContent className="pt-0">
        <Link
          href="/contact-us"
          className="flex w-full items-center justify-between py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Mail className="size-4" />
            Contact us
          </span>
          <ChevronRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
