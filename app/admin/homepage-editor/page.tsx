import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import HomepageEditorClient from "./homepage-editor-client"
import { getSectionTemplates } from "@/app/actions/pages"

export default async function HomepageEditorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: sectionsData } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  const templates = await getSectionTemplates()

  const sectionsWithTemplates = (sectionsData || []).map((section) => {
    const template = templates?.find((t) => t.id === section.section_template_id)
    return {
      ...section,
      section_templates: template || null,
    }
  })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomepageEditorClient sections={sectionsWithTemplates} templates={templates || []} />
    </Suspense>
  )
}
