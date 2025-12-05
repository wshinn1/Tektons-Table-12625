import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { getPlatformAnalytics } from "@/app/actions/admin"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const analytics = await getPlatformAnalytics()

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total Tenants</div>
            <div className="text-3xl font-bold mt-2">{analytics.totalTenants}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Active Tenants</div>
            <div className="text-3xl font-bold mt-2">{analytics.activeTenants}</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Total Donations</div>
            <div className="text-3xl font-bold mt-2">
              ${analytics.totalDonations.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Platform Revenue</div>
            <div className="text-3xl font-bold mt-2">
              ${analytics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Platform Fees (3.5%)</div>
            <div className="text-2xl font-bold mt-2">
              ${analytics.platformFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Tips Collected</div>
            <div className="text-2xl font-bold mt-2">
              ${analytics.tips.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Fee Coverage</div>
            <div className="text-2xl font-bold mt-2">
              ${analytics.feeCoverage.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <Button asChild>
              <Link href="/admin/tenants">View All Tenants</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/pages">Manage Pages</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/blog">Manage Blog</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/sections">Manage Sections</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/site-content">Edit Landing Page</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/demo-site">Edit Demo Site</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/backups">Backup Management</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/settings">Platform Settings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/help">Help Content</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
