import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/donation-tiers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Calendar, Heart } from "lucide-react"

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

  // Get all donations for this donor to this tenant
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .eq("status", "completed")
    .order("created_at", { ascending: false })

  // Get supporter record
  const { data: supporter } = await supabase
    .from("supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  // Calculate stats
  const totalGiven = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0
  const totalDonations = donations?.length || 0
  const recurringDonations = donations?.filter((d) => d.subscription_id) || []
  const isRecurring = supporter?.is_recurring || recurringDonations.length > 0
  const monthlyAmount = supporter?.recurring_amount ? Number(supporter.recurring_amount) : 0

  // Get first donation date
  const firstDonation = donations?.[donations.length - 1]
  const supportingSince = firstDonation
    ? new Date(firstDonation.created_at).toLocaleDateString("en-US", {
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
            <div className="text-2xl font-bold">{formatCurrency(totalGiven * 100)}</div>
            <p className="text-xs text-muted-foreground">All-time giving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonations}</div>
            <p className="text-xs text-muted-foreground">Total gifts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Giving</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isRecurring ? formatCurrency(monthlyAmount * 100) : "$0.00"}</div>
            <p className="text-xs text-muted-foreground">{isRecurring ? "Active recurring" : "No recurring gift"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supporting Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportingSince || "—"}</div>
            <p className="text-xs text-muted-foreground">First donation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Make a Gift</CardTitle>
            <CardDescription>Continue supporting this ministry</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/give">
                Give Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {isRecurring && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Recurring</CardTitle>
              <CardDescription>Update or cancel your monthly giving</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/donor/recurring">
                  Manage Subscription <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest gifts to this ministry</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/donor/giving">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentDonations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No donations yet</p>
          ) : (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">
                      {new Date(donation.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {donation.subscription_id && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Recurring</span>
                    )}
                  </div>
                  <p className="font-bold text-lg">{formatCurrency(Number(donation.amount || 0) * 100)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
