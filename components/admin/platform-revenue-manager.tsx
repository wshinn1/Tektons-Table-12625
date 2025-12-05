"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Transaction {
  id: string
  tenant_name: string
  amount: number
  fee: number
  net: number
  type: string
  created: number
  description: string
}

interface RevenueStats {
  todayRevenue: number
  monthRevenue: number
  yearRevenue: number
  projectedMonthRevenue: number
  projectedYearRevenue: number
  activeTenantsCount: number
  transactionsCount: number
}

interface ChartData {
  date: string
  revenue: number
}

export function PlatformRevenueManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<RevenueStats>({
    todayRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    projectedMonthRevenue: 0,
    projectedYearRevenue: 0,
    activeTenantsCount: 0,
    transactionsCount: 0,
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "today" | "month">("all")

  useEffect(() => {
    fetchRevenueData()
  }, [])

  async function fetchRevenueData() {
    try {
      const response = await fetch("/api/admin/platform-revenue")
      const data = await response.json()

      setTransactions(data.transactions || [])
      setStats(data.stats || stats)
      setChartData(data.chartData || [])
    } catch (error) {
      console.error("Failed to fetch revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTransactions = () => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000

    switch (filter) {
      case "today":
        return transactions.filter((t) => t.created >= startOfDay)
      case "month":
        return transactions.filter((t) => t.created >= startOfMonth)
      default:
        return transactions
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading revenue data...</div>
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Platform fees collected today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month to Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Projected: ${stats.projectedMonthRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year to Date</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.yearRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Projected: ${stats.projectedYearRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTenantsCount}</div>
            <p className="text-xs text-muted-foreground">{stats.transactionsCount} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart - Use BarChart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily platform revenue over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(142, 76%, 36%)",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${value}`} />
                <ChartTooltip content={<ChartTooltipContent />} formatter={(value) => [`$${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Platform fees collected from tenant payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as "all" | "today" | "month")}>
            <TabsList>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <TransactionsTable transactions={filteredTransactions} />
            </TabsContent>
            <TabsContent value="today" className="mt-4">
              <TransactionsTable transactions={filteredTransactions} />
            </TabsContent>
            <TabsContent value="month" className="mt-4">
              <TransactionsTable transactions={filteredTransactions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Platform Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {new Date(transaction.created * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.tenant_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.type}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  ${(transaction.amount / 100).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
