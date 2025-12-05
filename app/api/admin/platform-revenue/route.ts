import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import Stripe from "stripe"

export const dynamic = "force-dynamic"
export const revalidate = 0

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function GET(request: NextRequest) {
  try {
    const stripeKeyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 7) || "missing"
    console.log("[v0] Platform Revenue API - Stripe key prefix:", stripeKeyPrefix)

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isSuperAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch application fees from Stripe (platform fees from Connect)
    const applicationFees = await stripe.applicationFees.list({
      limit: 100,
    })

    console.log("[v0] Application fees count:", applicationFees.data.length)

    // Get tenant lookup map by stripe_account_id
    const { data: tenants } = await supabase.from("tenants").select("id, slug, full_name, stripe_account_id")

    const tenantMapByAccount = new Map<string, string>()
    const tenantMapBySlug = new Map<string, string>()

    tenants?.forEach((t) => {
      if (t.stripe_account_id) {
        tenantMapByAccount.set(t.stripe_account_id, t.full_name || t.slug)
      }
      tenantMapBySlug.set(t.slug, t.full_name || t.slug)
    })

    console.log("[v0] Tenant stripe_account_ids in DB:", Array.from(tenantMapByAccount.keys()))

    // Process transactions
    const transactions = applicationFees.data.map((fee) => {
      let tenantName = "Unknown Tenant"

      const accountId = fee.account as string

      console.log("[v0] Fee account:", accountId, "| Match:", tenantMapByAccount.get(accountId))

      if (accountId && tenantMapByAccount.has(accountId)) {
        tenantName = tenantMapByAccount.get(accountId)!
      }

      return {
        id: fee.id,
        tenant_name: tenantName,
        amount: fee.amount,
        fee: 0,
        net: fee.amount,
        type: "application_fee",
        created: fee.created,
        description: `Platform fee from ${tenantName}`,
      }
    })

    // Calculate stats
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime() / 1000

    const todayRevenue = transactions.filter((t) => t.created >= startOfDay).reduce((sum, t) => sum + t.amount, 0) / 100

    const monthRevenue =
      transactions.filter((t) => t.created >= startOfMonth).reduce((sum, t) => sum + t.amount, 0) / 100

    const yearRevenue = transactions.filter((t) => t.created >= startOfYear).reduce((sum, t) => sum + t.amount, 0) / 100

    // Project monthly revenue (simple linear projection based on days elapsed)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysElapsed = now.getDate()
    const projectedMonthRevenue = daysElapsed > 0 ? (monthRevenue / daysElapsed) * daysInMonth : 0

    // Project yearly revenue
    const daysInYear = 365
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const projectedYearRevenue = dayOfYear > 0 ? (yearRevenue / dayOfYear) * daysInYear : 0

    // Get active tenants count (excluding "Unknown Tenant")
    const uniqueTenants = new Set(transactions.map((t) => t.tenant_name).filter((n) => n !== "Unknown Tenant"))

    // Generate chart data (last 30 days)
    const chartData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dayStart = date.getTime() / 1000
      date.setHours(23, 59, 59, 999)
      const dayEnd = date.getTime() / 1000

      const dayRevenue =
        transactions.filter((t) => t.created >= dayStart && t.created <= dayEnd).reduce((sum, t) => sum + t.amount, 0) /
        100

      chartData.push({
        date: new Date(dayStart * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Number.parseFloat(dayRevenue.toFixed(2)),
      })
    }

    const response = NextResponse.json({
      transactions: transactions.slice(0, 50), // Return recent 50
      stats: {
        todayRevenue,
        monthRevenue,
        yearRevenue,
        projectedMonthRevenue,
        projectedYearRevenue,
        activeTenantsCount: uniqueTenants.size || 1, // At least 1 if there are transactions
        transactionsCount: transactions.length,
      },
      chartData,
    })

    // Prevent all caching
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Platform revenue error:", error)
    return NextResponse.json({ error: "Failed to fetch platform revenue" }, { status: 500 })
  }
}
