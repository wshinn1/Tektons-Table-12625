"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FinancialStats {
  total_donations: number
  monthly_donations: number
  donor_count: number
  average_donation: number
}

export function FinancialReportsManager({
  tenantId,
  stripeAccountId,
}: {
  tenantId: string
  stripeAccountId: string | null
}) {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/tenant/financial-stats?tenantId=${tenantId}`)
      if (!res.ok) throw new Error("Failed to fetch stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!stripeAccountId) {
    return (
      <Card className="p-12 text-center">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Stripe Not Connected</h3>
        <p className="text-muted-foreground">Connect your Stripe account to view financial reports</p>
      </Card>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading financial data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-2xl font-bold">${stats?.total_donations?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">${stats?.monthly_donations?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Donors</p>
              <p className="text-2xl font-bold">{stats?.donor_count || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Donation</p>
              <p className="text-2xl font-bold">${stats?.average_donation?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stripe Dashboard</h3>
        <p className="text-muted-foreground mb-4">
          For detailed transaction history and reports, visit your Stripe dashboard.
        </p>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Open Stripe Dashboard →
        </a>
      </Card>
    </div>
  )
}
