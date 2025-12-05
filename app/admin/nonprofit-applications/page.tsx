import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NonprofitApplicationReviewer } from "@/components/admin/nonprofit-application-reviewer"

export const metadata = {
  title: "Non-Profit Applications - Admin",
  description: "Review and approve non-profit tax-deductibility applications",
}

async function getNonprofitApplications() {
  const supabase = await createServerClient()

  const { data: applications } = await supabase
    .from("tenants")
    .select("*")
    .in("nonprofit_status", ["pending", "approved", "rejected"])
    .order("nonprofit_submitted_at", { ascending: false })

  return applications || []
}

export default async function NonprofitApplicationsPage() {
  const applications = await getNonprofitApplications()
  const pendingCount = applications.filter((app) => app.nonprofit_status === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Non-Profit Applications</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve missionary non-profit status for tax-deductibility
        </p>
      </div>

      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">
              {pendingCount} Application{pendingCount > 1 ? "s" : ""} Awaiting Review
            </CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-200">
              New non-profit applications need your attention
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Suspense fallback={<div>Loading applications...</div>}>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No non-profit applications yet
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <NonprofitApplicationReviewer key={application.id} application={application} />
            ))
          )}
        </div>
      </Suspense>
    </div>
  )
}
