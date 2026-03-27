import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_STATUSES = ["draft", "published", "archived", "trash"] as const
type PostStatus = (typeof ALLOWED_STATUSES)[number]

export async function POST(request: NextRequest) {
  try {
    const { postId, tenantId, status } = await request.json()
    if (!postId || !tenantId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!ALLOWED_STATUSES.includes(status as PostStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("blog_posts")
      .update({ status })
      .eq("id", postId)
      .eq("tenant_id", tenantId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { tenantId } = await request.json()
    if (!tenantId) return NextResponse.json({ error: "Missing tenantId" }, { status: 400 })
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("status", "trash")
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
