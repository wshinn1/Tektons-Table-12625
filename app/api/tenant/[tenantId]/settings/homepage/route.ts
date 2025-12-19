import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId } = params

    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("homepage_page_id")
      .eq("id", tenantId)
      .single()

    if (error) {
      console.error("[v0] Error fetching homepage setting:", error)
      return NextResponse.json({ homepage_page_id: null })
    }

    return NextResponse.json({ homepage_page_id: tenant?.homepage_page_id || null })
  } catch (error) {
    console.error("[v0] Error in GET /api/tenant/[tenantId]/settings/homepage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId } = params
    const body = await request.json()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { homepage_page_id } = body

    const { error } = await supabase
      .from("tenants")
      .update({
        homepage_page_id: homepage_page_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    if (error) {
      console.error("[v0] Error updating homepage setting:", error)
      return NextResponse.json({ error: "Failed to update homepage" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in PUT /api/tenant/[tenantId]/settings/homepage:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
