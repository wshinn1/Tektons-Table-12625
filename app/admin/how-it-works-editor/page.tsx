import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HowItWorksEditorClient } from "@/components/admin/how-it-works-editor-client"

async function getHowItWorksSections() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("how_it_works_sections").select("*").order("display_order")

  if (error) {
    console.error("Error fetching how-it-works sections:", error)
    return []
  }

  return data || []
}

export default async function HowItWorksEditorPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const sections = await getHowItWorksSections()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">How It Works Page Editor</h1>
          <p className="text-muted-foreground">Edit the content of your How It Works page sections.</p>
        </div>
        <HowItWorksEditorClient initialSections={sections} />
      </div>
    </div>
  )
}
