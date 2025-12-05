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

    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Contacts GET]", error)
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

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        source: body.source || "manual",
        tags: body.tags,
        notes: body.notes,
      })
      .select()
      .single()

    if (error) throw error

    // Add to groups if specified
    if (body.group_ids && body.group_ids.length > 0) {
      const members = body.group_ids.map((groupId: string) => ({
        contact_id: data.id,
        group_id: groupId,
      }))

      await supabase.from("contact_group_members").insert(members)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Contacts POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
