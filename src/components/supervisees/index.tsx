'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useSupervisees } from '@/lib/hooks'

export function SuperviseesPage() {
  const { data } = useSupervisees()
  const supervisees = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supervisees</h1>
        <p className="text-sm text-muted-foreground">Students registered in the matching system</p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supervisees.map((supervisee) => (
              <TableRow key={supervisee.id}>
                <TableCell>{supervisee.name}</TableCell>
                <TableCell>{supervisee.email}</TableCell>
                <TableCell>
                  <Badge variant={supervisee.supervisorId ? 'default' : 'secondary'}>
                    {supervisee.supervisorId ? 'Matched' : 'Unmatched'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
