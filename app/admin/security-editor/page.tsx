import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SecurityEditorClient } from "@/components/admin/security-editor-client"

export default async function SecurityEditorPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: sections } = await supabase.from("security_sections").select("*").order("display_order")

  if (!sections) {
    return <div>Failed to load sections</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Edit Security Page</h1>
          <p className="text-sm text-muted-foreground">Update the security page content</p>
        </div>
      </div>
      <SecurityEditorClient initialSections={sections} />
    </div>
  )
}
