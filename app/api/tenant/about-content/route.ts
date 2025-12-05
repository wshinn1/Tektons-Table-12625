import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { tenantId, content } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify tenant ownership
    const { data: tenant } = await supabase.from("tenants").select("id").eq("id", tenantId).single()

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Upsert about content
    const { data, error } = await supabase
      .from("about_content")
      .upsert(
        {
          tenant_id: tenantId,
          ...content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id" },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error updating about content:", error)
    return NextResponse.json({ error: "Failed to update about content" }, { status: 500 })
  }
}
