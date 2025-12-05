import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getGivingStats, getTotalRaised } from "@/app/actions/giving"
import { DonationFlowClient } from "@/components/tenant/donation-flow-client"
import { TaxDeductibilityNotice } from "@/components/tenant/tax-deductibility-notice"

export default async function TenantGivingPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createServerClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, is_registered_nonprofit, nonprofit_name, nonprofit_ein")
    .eq("subdomain", subdomain)
    .single()

  if (!tenant) {
    notFound()
  }

  const stats = await getGivingStats(tenant.id)
  const totalRaised = await getTotalRaised(tenant.id)

  const { data: settings } = await supabase
    .from("tenant_giving_settings")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single()

  const targetGoal = settings?.fundraising_target_goal || 5000
  const startAmount = settings?.fundraising_start_amount || 0

  const currentRaised = totalRaised
  const progressPercent = currentRaised > 0 ? Math.min((currentRaised / targetGoal) * 100, 100) : 0

  console.log("[v0] Giving page data:", {
    startAmount,
    totalRaised,
    currentRaised,
    targetGoal,
    progressPercent,
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {tenant.is_registered_nonprofit && (
          <div className="mb-6">
            <TaxDeductibilityNotice
              isRegisteredNonprofit={tenant.is_registered_nonprofit}
              nonprofitName={tenant.nonprofit_name}
              nonprofitEin={tenant.nonprofit_ein}
              tenantName={tenant.full_name || subdomain}
              variant="inline"
            />
          </div>
        )}

        <DonationFlowClient
          subdomain={subdomain}
          tenantId={tenant.id}
          tenantName={tenant.full_name || subdomain}
          currentRaised={currentRaised}
          goalAmount={targetGoal}
          progressPercent={progressPercent}
          supportersCount={stats.supportersCount}
        />
      </div>
    </div>
  )
}
