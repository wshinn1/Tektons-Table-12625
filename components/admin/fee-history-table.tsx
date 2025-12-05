import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface FeeAudit {
  id: string
  old_fee: number
  new_fee: number
  changed_at: string
  reason: string
  affected_tenants_count: number
  changed_by_admin?: { name: string }
}

interface Props {
  history: FeeAudit[]
}

export function FeeHistoryTable({ history }: Props) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No fee changes yet</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Change History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Old Fee</TableHead>
              <TableHead>New Fee</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Affected Tenants</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.changed_at).toLocaleDateString()}</TableCell>
                <TableCell>{record.old_fee?.toFixed(2)}%</TableCell>
                <TableCell>{record.new_fee.toFixed(2)}%</TableCell>
                <TableCell>{record.changed_by_admin?.name || 'System'}</TableCell>
                <TableCell>{record.reason}</TableCell>
                <TableCell>{record.affected_tenants_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
