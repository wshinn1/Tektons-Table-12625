import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsletterPuckEditor } from "@/components/tenant/newsletter-puck-editor"
import { getSubscriberGroups } from "@/app/actions/subscriber-groups"
import { emailsMatch } from "@/lib/utils"

export default async function ComposeNewsletterPage({
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
    redirect(`/${subdomain}/auth/login?redirect=/admin/newsletter/compose`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${subdomain}`)
  }

  const groups = await getSubscriberGroups(tenant.id)

  return <NewsletterPuckEditor tenantId={tenant.id} tenantName={tenant.name || tenant.subdomain} groups={groups} />
}
