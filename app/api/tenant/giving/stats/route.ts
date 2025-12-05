import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getTotalRaised, getGivingStats } from "@/app/actions/giving"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subdomain = searchParams.get("subdomain")

  console.log("[v0] ========== GIVING STATS API CALLED ==========")
  console.log("[v0] Giving stats API - subdomain:", subdomain)
  console.log("[v0] Timestamp:", new Date().toISOString())

  if (!subdomain) {
    return NextResponse.json({ error: "Missing subdomain" }, { status: 400 })
  }

  try {
    const supabase = await createServerClient()

    console.log("[v0] Giving stats API - Looking up tenant for subdomain:", subdomain)

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, subdomain, full_name")
      .eq("subdomain", subdomain)
      .eq("is_active", true)
      .single()

    if (tenantError) {
      console.error("[v0] Giving stats API - Tenant query error:", tenantError)
      return NextResponse.json({ error: "Tenant lookup failed" }, { status: 500 })
    }

    if (!tenant) {
      console.log("[v0] Giving stats API - Tenant not found")
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    console.log("[v0] Giving stats API - Found tenant:", {
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.full_name,
    })

    const totalRaised = await getTotalRaised(tenant.id)
    const stats = await getGivingStats(tenant.id)

    console.log("[v0] ===== GIVING STATS RESULT =====")
    console.log("[v0] Tenant ID:", tenant.id)
    console.log("[v0] Total Raised:", totalRaised)
    console.log("[v0] Supporters Count:", stats.supportersCount)
    console.log("[v0] Monthly Revenue:", stats.totalMonthlyRecurring)

    const response = {
      totalRaised,
      donationCount: stats.supportersCount,
      monthlyRevenue: stats.totalMonthlyRecurring,
    }

    console.log("[v0] Giving stats API - Returning:", JSON.stringify(response))
    console.log("[v0] ==========================================")

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching giving stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
