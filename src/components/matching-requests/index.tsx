'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchingRequestForm } from '@/components/matching-request-form'
import { useMatchingRequests } from '@/lib/hooks'
import type { MatchingStatus } from '@/types'

const statusVariantMap: Record<MatchingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
  cancelled: 'outline',
}

export function MatchingRequestsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data } = useMatchingRequests()
  const requests = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matching Requests</h1>
          <p className="text-sm text-muted-foreground">Manage supervisor–supervisee pairing requests</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>{showForm ? 'Cancel' : 'New Request'}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submit a Matching Request</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchingRequestForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {request.superviseeName} → {request.supervisorName}
                </p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{request.message}</p>
              </div>
              <Badge variant={statusVariantMap[request.status]} className="shrink-0 capitalize">
                {request.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
