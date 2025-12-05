import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { DonationCheckout } from "@/components/tenant/donation-checkout"
import { DEFAULT_DONATION_TIERS, formatCurrency } from "@/lib/donation-tiers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaxDeductibilityNotice } from "@/components/tenant/tax-deductibility-notice"
import { DonorAuthPrompt } from "@/components/tenant/donor-auth-prompt"
import { headers } from "next/headers"

export default async function DonationCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ tier?: string; amount?: string; type?: string; anonymous?: string }>
}) {
  const { tenant: subdomain } = await params
  const { tier: tierId, amount: customAmount, type: donationType, anonymous: isAnonymous } = await searchParams

  const headersList = await headers()
  const tenantSubdomain = headersList.get("x-tenant-subdomain") || ""
  const isSubdomain = tenantSubdomain === subdomain

  if (!tierId && !customAmount) {
    redirect(`/giving`)
  }

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, is_registered_nonprofit, nonprofit_name, nonprofit_ein")
    .eq("subdomain", subdomain)
    .single()

  if (!tenant) {
    notFound()
  }

  let tier
  let tierAmount
  let isRecurring
  let donationTierId

  if (tierId) {
    tier = DEFAULT_DONATION_TIERS.find((t) => t.id === tierId)
    if (!tier) {
      redirect(`/giving`)
    }
    tierAmount = tier.amountInCents / 100
    isRecurring = tier.recurring
    donationTierId = tierId
  } else if (customAmount) {
    const amount = Number.parseFloat(customAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      redirect(`/giving`)
    }
    tierAmount = amount
    isRecurring = donationType === "monthly"
    donationTierId = `custom-${donationType}-${amount}`

    tier = {
      id: donationTierId,
      name: `Custom ${isRecurring ? "Monthly" : "One-Time"} Donation`,
      amountInCents: amount * 100,
      recurring: isRecurring,
      description: `Your ${isRecurring ? "monthly" : "one-time"} contribution`,
      icon: "heart",
    }
  }

  const { data: givingSettings } = await supabase
    .from("tenant_giving_settings")
    .select("fee_model, suggested_tip_percent")
    .eq("tenant_id", tenant.id)
    .single()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let supporterProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from("supporter_profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .eq("tenant_id", tenant.id)
      .single()

    supporterProfile = profile
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Show welcome message for logged-in users */}
      {supporterProfile && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Welcome back, {supporterProfile.full_name}! Your donation will be linked to your account.
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Donation</h1>
        <p className="text-muted-foreground">
          You're supporting {tenant.full_name || subdomain} with {tier!.name} - {formatCurrency(tier!.amountInCents)}
          {tier!.recurring && "/month"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DonorAuthPrompt
            tenantId={tenant.id}
            currentEmail={user?.email}
            supporterName={supporterProfile?.full_name}
            isSubdomain={isSubdomain}
          />

          <DonationCheckout
            tenantId={tenant.id}
            tierId={donationTierId!}
            donorEmail={user?.email}
            feeModel={givingSettings?.fee_model || "platform_fee"}
            suggestedTipPercent={givingSettings?.suggested_tip_percent || 12}
            tierAmount={tierAmount!}
          />

          <TaxDeductibilityNotice
            isRegisteredNonprofit={tenant.is_registered_nonprofit || false}
            nonprofitName={tenant.nonprofit_name}
            nonprofitEin={tenant.nonprofit_ein}
            tenantName={tenant.full_name || subdomain}
            variant="inline"
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Donation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Tier</div>
                <div className="font-semibold">{tier!.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="text-2xl font-bold">{formatCurrency(tier!.amountInCents)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-semibold">{tier!.recurring ? "Monthly Recurring" : "One-Time"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
