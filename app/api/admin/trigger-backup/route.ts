import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Manual backup trigger - visit /api/admin/trigger-backup to run backup now
export async function GET(request: NextRequest) {
  try {
    // Verify admin user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if super admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "super_admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("[v0] Manual backup trigger - calling full-backup endpoint")

    // Call the full-backup endpoint internally
    const backupUrl = new URL("/api/cron/full-backup", request.url)
    const response = await fetch(backupUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    })

    const result = await response.json()

    console.log("[v0] Manual backup result:", result)

    return NextResponse.json({
      message: "Backup triggered",
      result,
    })
  } catch (error) {
    console.error("[v0] Manual backup trigger error:", error)
    return NextResponse.json(
      {
        error: "Failed to trigger backup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
