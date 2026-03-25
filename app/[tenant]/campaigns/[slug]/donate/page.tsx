import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CampaignDonationForm } from "@/components/tenant/campaign-donation-form"

interface PageProps {
  params: Promise<{
    tenant: string
    slug: string
  }>
}

export default async function CampaignDonatePage({ params }: PageProps) {
  const { tenant: tenantSubdomain, slug } = await params
  const supabase = await createServerClient()

  // Get tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, subdomain")
    .eq("subdomain", tenantSubdomain)
    .single()

  if (!tenant) {
    notFound()
  }

  // Get campaign
  const { data: campaign } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!campaign) {
    notFound()
  }

  // Get giving settings for fee model
  const { data: givingSettings } = await supabase
    .from("tenant_giving_settings")
    .select("fee_model, suggested_tip_percent")
    .eq("tenant_id", tenant.id)
    .single()

  const feeModel = givingSettings?.fee_model || "donor_tips"
  const suggestedTipPercent = givingSettings?.suggested_tip_percent || 12

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-12 px-4">
        {/* Back button */}
        <Link href={`/${tenantSubdomain}/campaigns/${slug}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Button>
        </Link>

        {/* Campaign header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support {campaign.title}</h1>
          <p className="text-muted-foreground">for {tenant.full_name}</p>
        </div>

        {/* Donation form */}
        <CampaignDonationForm
          tenantId={tenant.id}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
          suggestedAmounts={campaign.suggested_amounts || [25, 50, 100, 250, 500]}
          feeModel={feeModel}
          suggestedTipPercent={suggestedTipPercent}
          currentAmount={campaign.current_amount}
          goalAmount={campaign.goal_amount}
        />
      </div>
    </div>
  )
}
