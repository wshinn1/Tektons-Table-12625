import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ManageRecurringClient } from "@/components/donor/manage-recurring-client"

export default async function ManageRecurring({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/donor-login?redirect=/donor/manage-recurring`)
  }

  // Get tenant info
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, subdomain, stripe_account_id")
    .eq("subdomain", subdomain)
    .single()

  if (!tenant) {
    redirect(`/${subdomain}`)
  }

  // Get financial supporter record with Stripe customer ID
  const { data: financialSupporter } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  // Get recurring donations
  const { data: recurringDonations } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("supporter_id", financialSupporter?.id || "00000000-0000-0000-0000-000000000000")
    .eq("type", "recurring")
    .not("stripe_subscription_id", "is", null)
    .order("created_at", { ascending: false })

  const hasRecurring = financialSupporter?.monthly_amount && financialSupporter.monthly_amount > 0

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/${subdomain}/donor`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Giving
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Manage Recurring Giving
            </CardTitle>
            <CardDescription>View and manage your monthly donations to {tenant.full_name}</CardDescription>
          </CardHeader>
          <CardContent>
            {hasRecurring ? (
              <div className="space-y-6">
                {/* Current Subscription */}
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Active Monthly Gift</p>
                      <p className="text-3xl font-bold text-green-800">
                        ${financialSupporter.monthly_amount.toFixed(2)}/month
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                  <p className="text-sm text-green-700">Your next gift will be processed automatically.</p>
                </div>

                {/* Actions */}
                <ManageRecurringClient
                  tenantId={tenant.id}
                  subdomain={subdomain}
                  stripeAccountId={tenant.stripe_account_id}
                  stripeCustomerId={financialSupporter.stripe_customer_id}
                  currentAmount={financialSupporter.monthly_amount}
                />

                {/* Info */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Changes to your recurring donation may take a few minutes to reflect. If you cancel, your current
                      billing period will still be honored.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Recurring Donations</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any active monthly donations. Set up recurring giving to make a lasting impact.
                </p>
                <Button asChild>
                  <Link href={`/${subdomain}/giving?type=monthly`}>Start Monthly Giving</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
