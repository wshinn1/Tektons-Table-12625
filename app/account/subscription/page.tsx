import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SubscriptionDashboard } from "@/components/account/subscription-dashboard"

export const metadata = {
  title: "Subscription | Tekton's Table",
  description: "Manage your Premium Resources subscription",
}

export default async function SubscriptionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in?redirect=/account/subscription")
  }

  // Fetch subscription data
  const { data: subscription } = await supabase
    .from("premium_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Fetch comped access
  const { data: compedAccess } = await supabase
    .from("comped_access")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .single()

  // Check if user is a tenant (for trial info)
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, premium_trial_ends_at, premium_trial_used")
    .eq("user_id", user.id)
    .single()

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Subscription</h1>
      <p className="text-muted-foreground mb-8">Manage your Premium Resources subscription and billing</p>

      <SubscriptionDashboard user={user} subscription={subscription} compedAccess={compedAccess} tenant={tenant} />
    </div>
  )
}
