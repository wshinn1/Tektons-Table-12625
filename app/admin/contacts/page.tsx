import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContactsManager } from "@/components/admin/crm/contacts-manager"

export default async function ContactsPage() {
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
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-muted-foreground mt-2">Manage all contacts, organize groups, and track engagement</p>
      </div>

      <ContactsManager />
    </div>
  )
}
