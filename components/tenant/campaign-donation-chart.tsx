"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Donation {
  donation: {
    amount: number
    created_at: string
  }
}

interface Props {
  donations: Donation[]
}

export function CampaignDonationChart({ donations }: Props) {
  // Group donations by date for line chart
  const donationsByDate = donations.reduce(
    (acc, d) => {
      const date = new Date(d.donation.created_at).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 }
      }
      acc[date].total += Number(d.donation.amount)
      acc[date].count += 1
      return acc
    },
    {} as Record<string, { date: string; total: number; count: number }>,
  )

  const lineChartData = Object.values(donationsByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Group donations by amount ranges for bar chart
  const amountRanges = {
    "$0-$25": 0,
    "$26-$50": 0,
    "$51-$100": 0,
    "$101-$250": 0,
    "$251-$500": 0,
    "$500+": 0,
  }

  donations.forEach((d) => {
    const amount = Number(d.donation.amount)
    if (amount <= 25) amountRanges["$0-$25"]++
    else if (amount <= 50) amountRanges["$26-$50"]++
    else if (amount <= 100) amountRanges["$51-$100"]++
    else if (amount <= 250) amountRanges["$101-$250"]++
    else if (amount <= 500) amountRanges["$251-$500"]++
    else amountRanges["$500+"]++
  })

  const barChartData = Object.entries(amountRanges).map(([range, count]) => ({
    range,
    count,
  }))

  if (donations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donation Trends</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Charts will appear once donations are received</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donation Trends</CardTitle>
        <CardDescription>Visual breakdown of campaign donations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="distribution">Amount Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <ChartContainer
              config={{
                total: {
                  label: "Total Raised",
                  color: "hsl(142, 76%, 36%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-total)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="distribution">
            <ChartContainer
              config={{
                count: {
                  label: "Donations",
                  color: "hsl(142, 76%, 36%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
