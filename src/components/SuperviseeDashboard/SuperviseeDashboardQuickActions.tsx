import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { SUPERVISEE_DASHBOARD_QUICK_ACTIONS } from './SuperviseeDashboardQuickActionsData'

export function SuperviseeDashboardQuickActions() {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Jump to key tasks from here</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SUPERVISEE_DASHBOARD_QUICK_ACTIONS.map(
            ({ icon: Icon, label, description, href, linkText }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col gap-2 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <span className="mt-auto text-xs font-medium text-primary">{linkText}</span>
              </Link>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
