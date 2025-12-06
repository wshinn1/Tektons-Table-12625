import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Calendar, Heart, FileText, Receipt } from "lucide-react"

export default async function DonorDashboard({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/donor-login?redirect=/donor`)
  }

  // Get tenant info
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, subdomain, profile_image_url")
    .eq("subdomain", tenantSlug)
    .single()

  if (!tenant) {
    redirect("/")
  }

  const { data: financialSupporter } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  const { data: donations } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("supporter_id", financialSupporter?.id || "00000000-0000-0000-0000-000000000000")
    .eq("status", "completed")
    .order("donated_at", { ascending: false })

  // Calculate stats
  const totalGiven = financialSupporter?.total_given || 0
  const totalDonations = donations?.length || 0
  const isRecurring = (financialSupporter?.monthly_amount || 0) > 0
  const monthlyAmount = financialSupporter?.monthly_amount || 0

  // Get this year's total
  const currentYear = new Date().getFullYear()
  const thisYearDonations = donations?.filter((d) => new Date(d.donated_at).getFullYear() === currentYear) || []
  const thisYearTotal = thisYearDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0)

  // Get first donation date
  const supportingSince = financialSupporter?.first_gift_at
    ? new Date(financialSupporter.first_gift_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null

  // Recent donations (last 5)
  const recentDonations = donations?.slice(0, 5) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {tenant.profile_image_url && (
          <img
            src={tenant.profile_image_url || "/placeholder.svg"}
            alt=""
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">Your Support for {tenant.full_name}</h1>
          <p className="text-muted-foreground">Thank you for partnering with us in ministry</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Given</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGiven.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time giving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{currentYear} Giving</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisYearTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Giving</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isRecurring ? `$${monthlyAmount.toFixed(2)}` : "$0.00"}</div>
            <p className="text-xs text-muted-foreground">{isRecurring ? "Active recurring" : "No recurring gift"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonations}</div>
            <p className="text-xs text-muted-foreground">
              {supportingSince ? `Since ${supportingSince}` : "Total gifts"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Make a Gift</CardTitle>
            <CardDescription>Continue supporting this ministry</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/${tenantSlug}/giving`}>
                Give Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Summary</CardTitle>
            <CardDescription>View and print for tax purposes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href={`/${tenantSlug}/donor/tax-summary`}>
                <FileText className="mr-2 h-4 w-4" />
                View Summary
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage Recurring</CardTitle>
            <CardDescription>{isRecurring ? "Update or cancel" : "Start monthly giving"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href={isRecurring ? `/${tenantSlug}/donor/manage-recurring` : `/${tenantSlug}/giving?type=monthly`}>
                {isRecurring ? "Manage" : "Start"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest gifts to this ministry</CardDescription>
          </div>
          {donations && donations.length > 5 && (
            <Button variant="ghost" asChild>
              <Link href={`/${tenantSlug}/donor/giving`}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentDonations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No donations yet</p>
              <Button asChild className="mt-4">
                <Link href={`/${tenantSlug}/giving`}>Make Your First Gift</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">
                        {new Date(donation.donated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {donation.type === "recurring" && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Monthly</span>
                        )}
                        <Link
                          href={`/${tenantSlug}/donor/receipt/${donation.id}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          View Receipt
                        </Link>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-lg">${Number(donation.amount || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
