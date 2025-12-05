import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    const { data, error } = await supabase
      .from("contact_groups")
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("is_system", false)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Contact Group PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { id } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("contact_groups").delete().eq("id", id).eq("is_system", false)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Contact Group DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
