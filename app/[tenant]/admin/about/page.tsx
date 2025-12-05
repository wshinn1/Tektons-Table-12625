import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AboutPageEditor } from "@/components/tenant/admin/about-page-editor"

export default async function EditAboutPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${tenantSlug}`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", tenantSlug).single()

  if (!tenant || tenant.email !== user.email) {
    console.log("[v0] About page auth check:", { tenantEmail: tenant?.email, userEmail: user.email, allowed: false })
    redirect(`/${tenantSlug}`)
  }

  console.log("[v0] About page auth check passed:", { tenantEmail: tenant.email, userEmail: user.email })

  const { data: aboutContent } = await supabase.from("about_content").select("*").eq("tenant_id", tenant.id).single()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit About Page</h1>
        <p className="text-muted-foreground">Customize your about page content, images, and sections</p>
      </div>

      <AboutPageEditor tenantId={tenant.id} initialContent={aboutContent} tenantSlug={tenantSlug} />
    </div>
  )
}
