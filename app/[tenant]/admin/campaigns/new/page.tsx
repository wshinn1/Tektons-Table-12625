import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CampaignForm } from "@/components/tenant/campaign-form"

export default async function NewCampaignPage({
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
    redirect(`/${subdomain}/auth/login`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.email !== user.email) {
    redirect(`/${subdomain}`)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
        <p className="text-muted-foreground mt-2">Set up a fundraising campaign for a specific goal or project</p>
      </div>

      <CampaignForm tenantId={tenant.id} subdomain={subdomain} />
    </div>
  )
}
