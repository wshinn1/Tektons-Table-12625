import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = NextResponse.json(
      session
        ? {
            hasSession: true,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        : { hasSession: false },
    )

    response.headers.set("Access-Control-Allow-Origin", "https://wesshinn.tektonstable.com")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    response.headers.set("Access-Control-Allow-Credentials", "true")

    return response
  } catch (error) {
    console.error("[v0] Check main session error:", error)
    return NextResponse.json({ hasSession: false, error: String(error) }, { status: 500 })
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 })
  response.headers.set("Access-Control-Allow-Origin", "https://wesshinn.tektonstable.com")
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  return response
}
