import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { WorkflowsManager } from "@/components/admin/crm/workflows-manager"

export default async function WorkflowsPage() {
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
        <h1 className="text-3xl font-bold">Email Workflows</h1>
        <p className="text-muted-foreground mt-2">Create automated email sequences and drip campaigns</p>
      </div>

      <WorkflowsManager />
    </div>
  )
}
