import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsletterPuckEditor } from "@/components/tenant/newsletter-puck-editor"
import { getSubscriberGroups } from "@/app/actions/subscriber-groups"
import { emailsMatch } from "@/lib/utils"

export default async function EditNewsletterPage({
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
    redirect(`/${subdomain}/auth/login?redirect=/admin/newsletter/edit/${id}`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${subdomain}`)
  }

  const { data: newsletter } = await supabase
    .from("tenant_newsletters")
    .select("id, subject, content, puck_data, preheader, status, tenant_id")
    .eq("id", id)
    .single()

  if (!newsletter || newsletter.tenant_id !== tenant.id) {
    redirect(`/${subdomain}/admin/newsletter`)
  }

  const groups = await getSubscriberGroups(tenant.id)

  return (
    <NewsletterPuckEditor
      tenantId={tenant.id}
      tenantSlug={subdomain}
      tenantName={tenant.name || tenant.subdomain}
      newsletter={newsletter}
      groups={groups}
    />
  )
}
