import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sections } = await request.json()

    // Update each section
    for (const section of sections) {
      const { id, ...updateData } = section
      await supabase.from("pricing_sections").update(updateData).eq("id", id)
    }

    revalidatePath("/pricing")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating pricing sections:", error)
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 })
  }
}
