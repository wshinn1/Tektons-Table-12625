import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { Card } from "@/components/ui/card"

export default async function SystemLogsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/admin-login")
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-500 mt-1">View system activity and error logs</p>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">System logs viewer coming soon...</p>
      </Card>
    </div>
  )
}
