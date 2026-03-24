import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsletterDashboard } from "@/components/tenant/newsletter-dashboard"
import { emailsMatch } from "@/lib/utils"

export default async function TenantNewsletterManager({
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
    redirect(`/${subdomain}/auth/login?redirect=/admin/newsletter`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${subdomain}`)
  }

  return (
    <div className="p-8">
      <NewsletterDashboard tenantId={tenant.id} tenantName={tenant.name || tenant.subdomain} />
    </div>
  )
}
