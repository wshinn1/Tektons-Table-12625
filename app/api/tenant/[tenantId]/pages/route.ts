import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId } = params
    const body = await request.json()

    const { title, slug, content } = body

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 })
    }

    // Create the page
    const { data: page, error } = await supabase
      .from("tenant_pages")
      .insert({
        tenant_id: tenantId,
        title,
        slug,
        html_content: content || "",
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating page:", error)
      return NextResponse.json({ error: "Failed to create page", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/tenant/[tenantId]/pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId } = params

    const { data: pages, error } = await supabase
      .from("tenant_pages")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching pages:", error)
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("[v0] Error in GET /api/tenant/[tenantId]/pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
