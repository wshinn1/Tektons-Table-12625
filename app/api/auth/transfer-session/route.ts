import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// This endpoint allows transferring a session to a subdomain
// by exchanging a short-lived token for session cookies
export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Set the session using the provided tokens
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error("[v0] Session transfer error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Session transferred successfully for user:", data.user?.id)

    return NextResponse.json({ success: true, user: data.user })
  } catch (error) {
    console.error("[v0] Session transfer exception:", error)
    return NextResponse.json({ error: "Failed to transfer session" }, { status: 500 })
  }
}
