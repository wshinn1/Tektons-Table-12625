import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CampaignForm } from "@/components/tenant/campaign-form"
import { DeleteCampaignDialog } from "@/components/tenant/delete-campaign-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { emailsMatch } from "@/lib/utils"

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/login?redirect=/admin/campaigns/${id}/edit`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${subdomain}`)
  }

  // Fetch the campaign
  const { data: campaign } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .single()

  if (!campaign) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <p className="text-muted-foreground mt-2">Update your campaign details and settings</p>
        </div>
        <div className="flex gap-2">
          <DeleteCampaignDialog campaignId={campaign.id} campaignTitle={campaign.title} tenantId={tenant.id} />
          <Link href={`/${subdomain}/campaigns/${campaign.slug}`}>
            <Button variant="outline">View Public Page</Button>
          </Link>
        </div>
      </div>

      <CampaignForm tenantId={tenant.id} subdomain={subdomain} campaign={campaign} />
    </div>
  )
}
