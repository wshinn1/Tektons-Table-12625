import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ContactSubmissionsList } from "@/components/tenant/admin/contact-submissions-list"
import { emailsMatch } from "@/lib/utils"

export default async function ContactSubmissionsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  console.log("[v0] Contact submissions - loading for:", tenantSlug)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] Contact submissions - no user, redirecting")
    redirect(`/${tenantSlug}`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", tenantSlug).single()

  if (!tenant) {
    console.log("[v0] Contact submissions - tenant not found")
    notFound()
  }

  if (!emailsMatch(tenant.email, user.email)) {
    console.log("[v0] Contact submissions - not tenant owner", { tenantEmail: tenant.email, userEmail: user.email })
    redirect(`/${tenantSlug}`)
  }

  console.log("[v0] Contact submissions - fetching submissions for tenant:", tenant.id)

  const { data: submissions } = await supabase
    .from("tenant_contact_submissions")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Contact submissions - found:", submissions?.length || 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Form Submissions</h1>
        <p className="text-muted-foreground">View and manage messages from your contact form</p>
      </div>

      <ContactSubmissionsList submissions={submissions || []} tenantId={tenant.id} />
    </div>
  )
}
