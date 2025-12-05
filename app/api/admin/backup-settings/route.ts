import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { isSuperAdmin } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isSuperAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { emails } = await request.json()

    // Validate emails
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "At least one email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = emails.filter((email) => !emailRegex.test(email))

    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: "Invalid email addresses found" }, { status: 400 })
    }

    // Upsert the setting
    const { error } = await supabase.from("system_settings").upsert(
      {
        setting_key: "backup_email_recipients",
        setting_value: { emails },
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "setting_key",
      },
    )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving backup settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
