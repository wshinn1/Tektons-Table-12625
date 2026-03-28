import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSuperAdmin } from "@/lib/auth"

export async function GET(request: Request) {
  // Verify super admin
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get("tenantId")

  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenantId parameter" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch all three types of contacts in parallel
  const [subscribersResult, supportersResult, followersResult] = await Promise.all([
    // Email subscribers
    supabase
      .from("tenant_email_subscribers")
      .select("email, name, created_at, status")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),

    // Financial supporters
    supabase
      .from("tenant_financial_supporters")
      .select("name, email, total_given, monthly_amount, last_gift_at, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),

    // Followers with profile info
    supabase
      .from("tenant_followers")
      .select(`
        follower_id,
        status,
        created_at,
        follower:supporter_profiles!tenant_followers_follower_id_fkey(email, full_name)
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
  ])

  // Map followers to extract profile info
  const followers = (followersResult.data || []).map((f: any) => ({
    email: f.follower?.email || "—",
    name: f.follower?.full_name || null,
    status: f.status,
    created_at: f.created_at,
  }))

  return NextResponse.json({
    subscribers: subscribersResult.data || [],
    supporters: supportersResult.data || [],
    followers,
  })
}
