import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify super admin
    const { data: isSuperAdmin } = await supabase.from("super_admins").select("id").eq("id", user.id).single()

    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    const { data, error } = await supabase
      .from("help_articles")
      .insert({
        slug: body.slug,
        title: body.title,
        content: body.content,
        category: body.category,
        subcategory: body.subcategory,
        is_published: body.is_published || false,
        order_index: body.order_index || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating help article:", error)
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
  }
}
