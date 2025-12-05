import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewsletterComposer } from "@/components/tenant/newsletter-composer"

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
    redirect(`/auth/login`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.id !== user.id) {
    redirect(`/`)
  }

  const { data: newsletter } = await supabase.from("newsletters").select("*").eq("id", id).single()

  if (!newsletter || newsletter.tenant_id !== tenant.id) {
    redirect(`/admin/newsletter`)
  }

  return (
    <div className="p-8">
      <NewsletterComposer tenantId={tenant.id} newsletter={newsletter} />
    </div>
  )
}
