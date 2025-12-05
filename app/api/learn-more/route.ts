import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { first_name, last_name, email } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create contact
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        first_name,
        last_name,
        email,
        source: "learn_more",
      })
      .select()
      .single()

    if (contactError) {
      // Check if email already exists
      if (contactError.code === "23505") {
        return NextResponse.json({ error: "This email is already registered" }, { status: 400 })
      }
      throw contactError
    }

    // Get "Learn More Signups" group
    const { data: group } = await supabase
      .from("contact_groups")
      .select("id")
      .eq("name", "Learn More Signups")
      .eq("is_system", true)
      .single()

    // Add to group
    if (group) {
      await supabase.from("contact_group_members").insert({
        contact_id: contact.id,
        group_id: group.id,
      })
    }

    // Check for active "learn_more_signup" workflows
    const { data: workflows } = await supabase
      .from("email_workflows")
      .select("id")
      .eq("trigger_type", "learn_more_signup")
      .eq("is_active", true)

    // Enroll in workflows
    if (workflows && workflows.length > 0) {
      const enrollments = workflows.map((workflow) => ({
        workflow_id: workflow.id,
        contact_id: contact.id,
        current_step: 1,
        next_email_due_at: new Date().toISOString(), // Send first email immediately
      }))

      await supabase.from("workflow_enrollments").insert(enrollments)
    }

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error("[Learn More POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
