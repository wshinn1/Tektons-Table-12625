import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GivingSettingsForm } from "@/components/tenant/giving-settings-form"
import { StripeConnectCard } from "@/components/tenant/stripe-connect-card"
import { NonprofitApplicationForm } from "@/components/tenant/nonprofit-application-form"
import { getGivingStats } from "@/app/actions/giving"
import { formatCurrency } from "@/lib/donation-tiers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle } from "lucide-react"
import { emailsMatch } from "@/lib/utils"

export default async function TenantGivingManager({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const { tenant: subdomain } = await params
  const { success, error } = await searchParams
  const supabase = await createClient()

  console.log("[v0] TenantGivingManager - subdomain:", subdomain)
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  console.log("[v0] TenantGivingManager - user:", user?.id, user?.email)
  console.log("[v0] TenantGivingManager - authError:", authError?.message)

  if (!user) {
    console.log("[v0] TenantGivingManager - No user, redirecting to login")
    // Use the subdomain-prefixed path because this is a server component 
    // that runs after middleware rewriting. The browser is on subdomain.tektonstable.com
    // but internally we're at /[tenant]/admin/giving, so redirect needs the full internal path.
    redirect(`/${subdomain}/auth/login?redirect=/admin/giving`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${subdomain}`)
  }

  const stats = await getGivingStats(tenant.id)

  const totalSupporters = stats?.totalSupporters ?? 0
  const monthlySupporters = stats?.monthlySupporters ?? 0
  const totalMonthlyRecurring = stats?.totalMonthlyRecurring ?? 0
  const totalLifetimeGiving = stats?.totalLifetimeGiving ?? 0

  const { data: settings } = await supabase
    .from("tenant_giving_settings")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Giving Page Manager</h1>
        <p className="text-muted-foreground mt-2">Configure your donation goals and view financial supporters.</p>
      </div>

      {success === "connected" && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Successfully connected to Stripe! You can now receive donations.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600 dark:text-red-400">
            {error === "access_denied" && "You denied access to Stripe."}
            {error === "unauthorized" && "Unauthorized access."}
            {error === "connection_failed" && "Failed to connect to Stripe. Please try again."}
            {error === "invalid_grant" && "The authorization code expired. Please try connecting again."}
            {error === "expired_code" && "The authorization request took too long. Please try connecting again."}
            {error === "config_error" && "Stripe is not properly configured. Please contact support."}
            {![
              "access_denied",
              "unauthorized",
              "connection_failed",
              "invalid_grant",
              "expired_code",
              "config_error",
            ].includes(error) && `An error occurred: ${error}`}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <StripeConnectCard
          tenantId={tenant.id}
          subdomain={subdomain}
          stripeAccountId={tenant.stripe_account_id}
          stripeAccountStatus={tenant.stripe_account_status}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Supporters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSupporters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlySupporters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyRecurring * 100)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Giving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLifetimeGiving * 100)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <GivingSettingsForm tenantId={tenant.id} initialSettings={settings || undefined} />

        <NonprofitApplicationForm
          tenantId={tenant.id}
          initialData={{
            nonprofitStatus: tenant.nonprofit_status || "none",
            nonprofitName: tenant.nonprofit_name,
            nonprofitEin: tenant.nonprofit_ein,
            nonprofitAddress: tenant.nonprofit_address,
            nonprofitExemptionLetterUrl: tenant.nonprofit_exemption_letter_url,
            nonprofitRejectionReason: tenant.nonprofit_rejection_reason,
            nonprofitSubmittedAt: tenant.nonprofit_submitted_at,
            nonprofitVerifiedAt: tenant.nonprofit_verified_at,
          }}
        />
      </div>
    </div>
  )
}
