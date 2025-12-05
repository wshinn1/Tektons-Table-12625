"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

interface Donation {
  donation: {
    amount: number
    is_recurring: boolean
    supporter: {
      id: string
      full_name: string | null
      email: string
    }
  }
}

interface Props {
  donations: Donation[]
  showDonorList: boolean
}

export function CampaignTopDonors({ donations, showDonorList }: Props) {
  // Group donations by supporter and sum amounts
  const donorTotals = donations.reduce(
    (acc, d) => {
      const supporterId = d.donation.supporter?.id || "anonymous"
      if (!acc[supporterId]) {
        acc[supporterId] = {
          id: supporterId,
          name: showDonorList ? d.donation.supporter?.full_name || "Anonymous" : "Anonymous",
          email: showDonorList ? d.donation.supporter?.email : "",
          total: 0,
          count: 0,
          isRecurring: false,
        }
      }
      acc[supporterId].total += Number(d.donation.amount)
      acc[supporterId].count += 1
      if (d.donation.is_recurring) {
        acc[supporterId].isRecurring = true
      }
      return acc
    },
    {} as Record<
      string,
      { id: string; name: string; email: string; total: number; count: number; isRecurring: boolean }
    >,
  )

  const topDonors = Object.values(donorTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  if (topDonors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription>Highest contributing supporters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No donors yet</p>
            <p className="text-sm">Top donors will be recognized here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Donors</CardTitle>
        <CardDescription>
          {showDonorList ? "Highest contributing supporters" : "Top donor statistics (names hidden)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topDonors.map((donor, index) => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 inline mr-1" />}
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{donor.name}</p>
                      {showDonorList && donor.email && <p className="text-sm text-muted-foreground">{donor.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{donor.count}</span>
                      {donor.isRecurring && (
                        <Badge variant="secondary" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">${donor.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
