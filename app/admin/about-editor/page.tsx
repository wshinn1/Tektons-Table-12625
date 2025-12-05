import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AboutEditorClient } from "@/components/admin/about-editor-client"

export default async function AboutEditorPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch current about sections from database
  const { data: sections, error } = await supabase
    .from("about_sections")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching about sections:", error)
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">About Page Editor</h1>
        <p className="text-gray-500 mt-2">Edit all sections of the about page from one place.</p>
      </div>

      <AboutEditorClient initialSections={sections || []} />
    </div>
  )
}
