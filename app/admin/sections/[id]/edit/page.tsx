import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { redirect, notFound } from "next/navigation"
import { SectionEditor } from "@/components/admin/section-editor"

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const { data: section, error } = await supabase.from("section_templates").select("*").eq("id", id).single()

  if (error || !section) {
    notFound()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <SectionEditor section={section} />
    </div>
  )
}
