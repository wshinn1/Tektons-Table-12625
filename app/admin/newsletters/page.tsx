import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NewslettersManager } from "@/components/admin/crm/newsletters-manager"

export default async function NewslettersPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    redirect("/admin")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Newsletters</h1>
        <p className="text-muted-foreground mt-2">Create and send newsletters to your contact groups</p>
      </div>

      <NewslettersManager />
    </div>
  )
}
