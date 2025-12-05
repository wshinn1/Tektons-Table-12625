import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PricingEditorClient } from "@/components/admin/pricing-editor-client"

export const dynamic = "force-dynamic"

export default async function PricingEditorPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: sections } = await supabase
    .from("pricing_sections")
    .select("*")
    .order("display_order", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Edit Pricing Page</h1>
          <p className="text-muted-foreground mt-2">Customize the content and appearance of your pricing page</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <PricingEditorClient initialSections={sections || []} />
      </div>
    </div>
  )
}
