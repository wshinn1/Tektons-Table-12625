"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  amount: number
  platform_fee: number
  tip_amount: number
  created_at: string
  tenants: { full_name: string; subdomain: string } | null
  supporters: { full_name: string; email: string } | null
}

interface TransactionTableProps {
  donations: Transaction[]
}

export function TransactionTable({ donations }: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Badge variant="secondary">{donations.length} transactions</Badge>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Supporter</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Platform Fee</TableHead>
              <TableHead className="text-right">Tip</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="text-sm">{formatDate(donation.created_at)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{donation.tenants?.full_name || "Unknown"}</div>
                      {donation.tenants?.subdomain && (
                        <div className="text-xs text-muted-foreground">@{donation.tenants.subdomain}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{donation.supporters?.full_name || "Anonymous"}</div>
                      {donation.supporters?.email && (
                        <div className="text-xs text-muted-foreground">{donation.supporters.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(donation.amount)}</TableCell>
                  <TableCell className="text-right text-blue-600 font-medium">
                    {formatCurrency(donation.platform_fee)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(donation.tip_amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
