import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { SectionCreator } from "@/components/admin/section-creator"

export default async function CreateSectionPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Section</h1>
        <p className="text-muted-foreground mt-2">
          Upload a screenshot to create an editable section, or build one from scratch
        </p>
      </div>

      <SectionCreator />
    </div>
  )
}
