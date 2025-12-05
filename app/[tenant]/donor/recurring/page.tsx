import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/donation-tiers"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default async function DonorRecurringPage({
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
    redirect(`/auth/donor-login?redirect=/donor/recurring`)
  }

  // Get tenant info with stripe account
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, stripe_account_id")
    .eq("subdomain", tenantSlug)
    .single()

  if (!tenant) {
    redirect("/")
  }

  // Get supporter record with subscription info
  const { data: supporter } = await supabase
    .from("supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  // Get recurring donations
  const { data: recurringDonations } = await supabase
    .from("donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .not("subscription_id", "is", null)
    .order("created_at", { ascending: false })

  const hasRecurring = supporter?.is_recurring || (recurringDonations && recurringDonations.length > 0)
  const monthlyAmount = supporter?.recurring_amount ? Number(supporter.recurring_amount) : 0
  const subscriptionId = recurringDonations?.[0]?.subscription_id

  // Build Stripe portal URL if we have the required info
  const stripePortalUrl =
    subscriptionId && tenant.stripe_account_id
      ? `/api/stripe/customer-portal?email=${encodeURIComponent(user.email!)}&tenant_id=${tenant.id}`
      : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Recurring Giving</h1>
        <p className="text-muted-foreground">Update or cancel your monthly support for {tenant.full_name}</p>
      </div>

      {!hasRecurring ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Recurring Gift</CardTitle>
            <CardDescription>You don't have a recurring donation set up for this ministry</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/give">Set Up Monthly Giving</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Active Subscription</CardTitle>
              <CardDescription>Your current monthly giving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyAmount * 100)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-medium text-green-600">Active</p>
                </div>
              </div>

              {stripePortalUrl ? (
                <Button className="w-full" asChild>
                  <a href={stripePortalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage in Stripe Portal
                  </a>
                </Button>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Portal Unavailable</AlertTitle>
                  <AlertDescription>
                    Please contact {tenant.full_name} directly to manage your subscription.
                  </AlertDescription>
                </Alert>
              )}

              <p className="text-xs text-muted-foreground text-center">
                In the Stripe portal you can update your payment method, change your donation amount, or cancel your
                recurring gift.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Recurring Payments</CardTitle>
              <CardDescription>History of your monthly gifts</CardDescription>
            </CardHeader>
            <CardContent>
              {recurringDonations && recurringDonations.length > 0 ? (
                <div className="space-y-3">
                  {recurringDonations.slice(0, 6).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <p className="text-sm">
                        {new Date(donation.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="font-medium">{formatCurrency(Number(donation.amount || 0) * 100)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No recurring payments recorded yet</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
