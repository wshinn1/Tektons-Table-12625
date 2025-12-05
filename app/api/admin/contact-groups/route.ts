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

    // Get all groups with member counts
    const { data: groups, error } = await supabase
      .from("contact_groups")
      .select(`
        id,
        name,
        description,
        is_system,
        created_at,
        contact_group_members (count)
      `)
      .order("is_system", { ascending: false })
      .order("name")

    if (error) throw error

    // Transform to include member_count
    const groupsWithCounts = groups?.map((group: any) => ({
      ...group,
      member_count: group.contact_group_members?.[0]?.count || 0,
      contact_group_members: undefined,
    }))

    return NextResponse.json(groupsWithCounts)
  } catch (error) {
    console.error("[Contact Groups GET]", error)
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

    const { name, description } = await request.json()

    const { data, error } = await supabase
      .from("contact_groups")
      .insert({ name, description, is_system: false })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Contact Groups POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
