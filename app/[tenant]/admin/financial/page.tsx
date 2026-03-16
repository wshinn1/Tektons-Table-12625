import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/donation-tiers"
import { DollarSign, Users, Calendar } from "lucide-react"

export default async function TenantFinancialReports({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()

  console.log("[v0] Financial page - loading for:", subdomain)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] Financial page - no user, redirecting to login")
    redirect(`/${subdomain}/auth/login`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant) {
    console.log("[v0] Financial page - tenant not found")
    notFound()
  }

  if (tenant.email !== user.email) {
    console.log("[v0] Financial page - not tenant owner")
    redirect(`/${subdomain}`)
  }

  const hasStripe = !!tenant.stripe_account_id

  console.log("[v0] Financial page - tenant:", tenant.id, "hasStripe:", hasStripe)

  const { data: donations, error } = hasStripe
    ? await supabase
        .from("donations")
        .select(`
          *,
          supporter:supporters (
            full_name,
            email
          )
        `)
        .eq("tenant_id", tenant.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
    : { data: [], error: null }

  console.log("[v0] Donations query executed:", {
    hasStripe,
    tenantId: tenant.id,
    count: donations?.length || 0,
    error: error?.message,
    firstDonationId: donations?.[0]?.id,
    firstDonationAmount: donations?.[0]?.amount,
  })

  const totalRevenue = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0
  const donorCount = new Set(donations?.map((d) => d.supporter_id).filter(Boolean)).size
  const donationCount = donations?.length || 0

  console.log("[v0] Financial stats:", { totalRevenue, donorCount, donationCount })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground mt-2">View giving history and generate reports</p>
      </div>

      {!hasStripe ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Stripe</CardTitle>
            <CardDescription>Connect your Stripe account to view financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You need to connect Stripe to accept donations and view financial reports.
            </p>
            <Button asChild>
              <a href={`/${subdomain}/admin/giving`}>Go to Giving Settings</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue * 100)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{donorCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{donationCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Your most recent donations</CardDescription>
            </CardHeader>
            <CardContent>
              {donationCount === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No donations yet. Donations will appear here once supporters give.
                </p>
              ) : (
                <div className="space-y-4">
                  {donations?.slice(0, 20).map((donation) => (
                    <div key={donation.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">
                          {donation.supporter?.full_name || "Anonymous"}
                          {donation.is_recurring && (
                            <span className="ml-2 text-xs text-purple-600 font-normal">(Recurring)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{donation.supporter?.email || "No email"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(Number(donation.amount) * 100)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
