import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { tenantId: string; pageId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId, pageId } = params

    const { data: page, error } = await supabase
      .from("tenant_pages")
      .select("*")
      .eq("id", pageId)
      .eq("tenant_id", tenantId)
      .single()

    if (error) {
      console.error("[v0] Error fetching page:", error)
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error("[v0] Error in GET /api/tenant/[tenantId]/pages/[pageId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { tenantId: string; pageId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId, pageId } = params
    const body = await request.json()

    const { title, slug, content, design_json, status } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (title) updateData.title = title
    if (slug) updateData.slug = slug
    if (content !== undefined) updateData.html_content = content
    if (design_json !== undefined) updateData.design_json = design_json
    if (status) updateData.status = status

    const { data: page, error } = await supabase
      .from("tenant_pages")
      .update(updateData)
      .eq("id", pageId)
      .eq("tenant_id", tenantId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating page:", error)
      return NextResponse.json({ error: "Failed to update page", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error("[v0] Error in PUT /api/tenant/[tenantId]/pages/[pageId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { tenantId: string; pageId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId, pageId } = params

    const { error } = await supabase.from("tenant_pages").delete().eq("id", pageId).eq("tenant_id", tenantId)

    if (error) {
      console.error("[v0] Error deleting page:", error)
      return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/tenant/[tenantId]/pages/[pageId]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
