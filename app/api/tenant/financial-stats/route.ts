import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get donation statistics
    const { data: donations, error } = await supabase
      .from("donations")
      .select("amount, created_at, donor_email")
      .eq("tenant_id", tenantId)
      .eq("status", "completed")

    if (error) throw error

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
    const monthlyDonations =
      donations
        ?.filter((d) => {
          const date = new Date(d.created_at)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })
        .reduce((sum, d) => sum + (d.amount || 0), 0) || 0

    const uniqueDonors = new Set(donations?.map((d) => d.donor_email) || []).size
    const averageDonation = donations && donations.length > 0 ? totalDonations / donations.length : 0

    return NextResponse.json({
      total_donations: totalDonations,
      monthly_donations: monthlyDonations,
      donor_count: uniqueDonors,
      average_donation: averageDonation,
    })
  } catch (error) {
    console.error("Error fetching financial stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
