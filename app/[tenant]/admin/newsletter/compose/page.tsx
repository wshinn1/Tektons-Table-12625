import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsletterComposer } from "@/components/tenant/newsletter-composer"
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <NewsletterComposer tenantId={tenant.id} groups={groups} />
    </div>
  )
}
