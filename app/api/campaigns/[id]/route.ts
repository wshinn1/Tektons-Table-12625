import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  try {
    const body = await request.json()
    const { tenantId } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 })
    }

    // Verify the campaign belongs to this tenant
    const { data: campaign, error: fetchError } = await supabase
      .from("tenant_campaigns")
      .select("id, tenant_id")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Delete the campaign (donations will remain via foreign key constraints)
    const { error: deleteError } = await supabase
      .from("tenant_campaigns")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)

    if (deleteError) {
      console.error("[v0] Error deleting campaign:", deleteError)
      return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/campaigns/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
