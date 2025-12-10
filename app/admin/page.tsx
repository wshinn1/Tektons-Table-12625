import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { DollarSign, Users, TrendingUp, Crown, Calendar } from "lucide-react"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

async function getPlatformRevenueStats() {
  try {
    // Get application fees (platform fees from tenant donations via Stripe Connect)
    const applicationFees = await stripe.applicationFees.list({ limit: 100 })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime() / 1000

    const monthRevenue =
      applicationFees.data.filter((f) => f.created >= startOfMonth).reduce((sum, f) => sum + f.amount, 0) / 100

    const yearRevenue =
      applicationFees.data.filter((f) => f.created >= startOfYear).reduce((sum, f) => sum + f.amount, 0) / 100

    return { monthRevenue, yearRevenue, transactionsCount: applicationFees.data.length }
  } catch (error) {
    console.error("Error fetching platform revenue:", error)
    return { monthRevenue: 0, yearRevenue: 0, transactionsCount: 0 }
  }
}

async function getPremiumSubscriptionStats(supabase: any) {
  try {
    // Get all premium subscriptions
    const { data: subscriptions, error } = await supabase
      .from("premium_subscriptions")
      .select("*, users:user_id(email)")
      .order("created_at", { ascending: false })

    if (error) throw error

    const activeSubscriptions = subscriptions?.filter((s: any) => s.status === "active") || []

    // Calculate monthly recurring revenue from premium subscriptions
    // Assuming $10/month for premium (adjust based on your actual price)
    const premiumMonthlyRate = 10
    const premiumMRR = activeSubscriptions.length * premiumMonthlyRate

    return {
      totalSubscribers: subscriptions?.length || 0,
      activeSubscribers: activeSubscriptions.length,
      premiumMRR,
      subscriptions: subscriptions || [],
    }
  } catch (error) {
    console.error("Error fetching premium stats:", error)
    return { totalSubscribers: 0, activeSubscribers: 0, premiumMRR: 0, subscriptions: [] }
  }
}

export default async function AdminDashboard() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  // Fetch all stats in parallel
  const [{ count: totalTenants }, { count: activeTenants }, platformRevenue, premiumStats] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase
      .from("tenants")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    getPlatformRevenueStats(),
    getPremiumSubscriptionStats(supabase),
  ])

  // Get user emails for premium subscribers
  const subscriberEmails = new Map<string, string>()
  if (premiumStats.subscriptions.length > 0) {
    const userIds = premiumStats.subscriptions.map((s: any) => s.user_id).filter(Boolean)
    if (userIds.length > 0) {
      // Try to get emails from auth.users via a different approach
      // Since we can't directly query auth.users, we'll use the profiles or stored email
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Tenants</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">{totalTenants || 0}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Active Tenants</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">{activeTenants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Platform Revenue (MTD)</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">
              ${platformRevenue.monthRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From tenant fees</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Platform Revenue (YTD)</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold mt-2">
              ${platformRevenue.yearRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{platformRevenue.transactionsCount} transactions</p>
          </Card>
        </div>

        {/* Premium Subscription Stats */}
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Premium Subscribers</div>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{premiumStats.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {premiumStats.totalSubscribers} total (including inactive)
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Premium MRR</div>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold mt-2">
              ${premiumStats.premiumMRR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly recurring revenue</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Revenue (MTD)</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              $
              {(platformRevenue.monthRevenue + premiumStats.premiumMRR).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fees + Premium subscriptions</p>
          </Card>
        </div>

        {/* Premium Subscribers List */}
        {premiumStats.subscriptions.length > 0 && (
          <Card className="mt-6">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold">Premium Subscribers</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Users with active premium resource subscriptions</p>
            </div>
            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead>Subscribed Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {premiumStats.subscriptions.slice(0, 10).map((sub: any) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-xs">{sub.user_id?.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.status === "active" ? "default" : "secondary"}
                          className={sub.status === "active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.current_period_end ? (
                          <>Until {new Date(sub.current_period_end).toLocaleDateString()}</>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {premiumStats.subscriptions.length > 10 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Showing 10 of {premiumStats.subscriptions.length} subscribers
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <Button asChild>
              <Link href="/admin/tenants">View All Tenants</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/platform-revenue">Detailed Revenue</Link>
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
