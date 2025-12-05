import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("admin_newsletters")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Newsletters GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Get super admin ID
    const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

    const { data: newsletterData, error: newsletterError } = await supabase
      .from("admin_newsletters")
      .insert({
        subject: body.subject,
        preview_text: body.preview_text,
        content: body.content,
        target_groups: body.target_groups,
        status: body.status || "draft",
        created_by: superAdmin?.id,
      })
      .select()
      .single()

    if (newsletterError) throw newsletterError

    return NextResponse.json(newsletterData)
  } catch (error) {
    console.error("[Newsletters POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
