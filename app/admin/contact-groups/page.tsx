import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContactGroupsManager } from "@/components/admin/crm/contact-groups-manager"

export default async function ContactGroupsPage() {
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
        <h1 className="text-3xl font-bold">Contact Groups</h1>
        <p className="text-muted-foreground mt-2">Organize contacts into groups for targeted communication</p>
      </div>

      <ContactGroupsManager />
    </div>
  )
}
