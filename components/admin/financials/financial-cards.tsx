"use client"

import { Card } from "@/components/ui/card"

interface FinancialMetrics {
  total_donations: number
  total_platform_fees: number
  total_tips: number
  fee_coverage_collected: number
  total_tenants: number
  active_tenants: number
}

interface FinancialCardsProps {
  metrics: FinancialMetrics | null
}

export function FinancialCards({ metrics }: FinancialCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="text-sm text-muted-foreground">Total Donations</div>
        <div className="text-3xl font-bold mt-2">{formatCurrency(Number(metrics?.total_donations || 0))}</div>
        <p className="text-xs text-muted-foreground mt-2">From {metrics?.active_tenants || 0} active tenants</p>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-900">Platform Fees (3.5%)</div>
        <div className="text-3xl font-bold mt-2 text-blue-900">
          {formatCurrency(Number(metrics?.total_platform_fees || 0))}
        </div>
        <p className="text-xs text-blue-700 mt-2">Your revenue from platform</p>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground">Tips Collected</div>
        <div className="text-3xl font-bold mt-2">{formatCurrency(Number(metrics?.total_tips || 0))}</div>
        <p className="text-xs text-muted-foreground mt-2">Optional support from donors</p>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground">Fee Coverage</div>
        <div className="text-3xl font-bold mt-2">{formatCurrency(Number(metrics?.fee_coverage_collected || 0))}</div>
        <p className="text-xs text-muted-foreground mt-2">Stripe fees covered by donors</p>
      </Card>
    </div>
  )
}
