import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { ManageSubscriptionButton } from "@/components/supporter/manage-subscription-button"

export default async function SupporterPaymentsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/supporter-login")
  }

  // Get active subscriptions
  const { data: subscriptions } = await supabase
    .from("donations")
    .select(`
      *,
      tenants (
        name,
        subdomain,
        stripe_account_id
      )
    `)
    .eq("email", user.email)
    .eq("status", "active")
    .not("subscription_id", "is", null)

  return (
    <div className="container mx-auto py-8 px-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <p className="text-muted-foreground">Manage your recurring donations and payment information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Recurring Donations</CardTitle>
          <CardDescription>Manage your monthly support commitments</CardDescription>
        </CardHeader>
        <CardContent>
          {!subscriptions || subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active recurring donations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{subscription.tenants?.name}</p>
                    <p className="text-sm text-muted-foreground">Monthly: ${Number(subscription.amount).toFixed(2)}</p>
                  </div>
                  <ManageSubscriptionButton
                    subscriptionId={subscription.subscription_id}
                    stripeAccountId={subscription.tenants?.stripe_account_id}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
