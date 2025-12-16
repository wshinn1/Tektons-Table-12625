import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageBuilderRequestCard } from "@/components/admin/page-builder-request-card"
import { getPageBuilderRequests } from "@/app/actions/admin-page-builder"

export const dynamic = "force-dynamic"

export default async function PageBuilderRequestsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/admin-login")
  }

  const { requests, error } = await getPageBuilderRequests()

  const pendingRequests = requests.filter((r) => !r.plasmic_project_id || !r.plasmic_api_token)
  const configuredRequests = requests.filter((r) => r.plasmic_project_id && r.plasmic_api_token)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Page Builder Requests</h1>
          <p className="text-muted-foreground mt-1">Manage tenant requests for custom Plasmic page builders</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="text-lg px-4 py-2">
            {pendingRequests.length} Pending
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {configuredRequests.length} Configured
          </Badge>
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Requests</h2>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <PageBuilderRequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {/* Configured Requests */}
      {configuredRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Already Configured</h2>
          <div className="grid gap-4">
            {configuredRequests.map((request) => (
              <PageBuilderRequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No page builder requests yet</p>
        </Card>
      )}
    </div>
  )
}
