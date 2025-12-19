import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsletterPuckEditor } from "@/components/tenant/newsletter-puck-editor"
import { getSubscriberGroups } from "@/app/actions/subscriber-groups"

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
    redirect("/auth/login")
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.email !== user.email) {
    redirect("/")
  }

  const groups = await getSubscriberGroups(tenant.id)

  return <NewsletterPuckEditor tenantId={tenant.id} tenantName={tenant.name || tenant.subdomain} groups={groups} />
}
