import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { FinancialCards } from "@/components/admin/financials/financial-cards"
import { RevenueChart } from "@/components/admin/financials/revenue-chart"
import { TransactionTable } from "@/components/admin/financials/transaction-table"

export default async function FinancialsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  // Get overall financial metrics
  const { data: metrics } = await supabase.from("admin_financials").select("*").single()

  // Get recent transactions
  const { data: recentDonations } = await supabase
    .from("donations")
    .select(`
      *,
      tenants (full_name, subdomain),
      supporters (full_name, email)
    `)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-500 mt-1">Track platform revenue and tenant activity</p>
      </div>

      <FinancialCards metrics={metrics} />

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        <RevenueChart />
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Active Tenants</div>
              <div className="text-2xl font-bold">{metrics?.active_tenants || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Donations</div>
              <div className="text-2xl font-bold">{metrics?.successful_donations_count || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Average Donation</div>
              <div className="text-2xl font-bold">${Number(metrics?.average_donation || 0).toFixed(2)}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <TransactionTable donations={recentDonations || []} />
      </div>
    </div>
  )
}
