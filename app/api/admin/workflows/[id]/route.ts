import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("email_workflows")
      .update({
        name: body.name,
        description: body.description,
        trigger_type: body.trigger_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (workflowError) throw workflowError

    // Delete existing steps
    await supabase.from("workflow_steps").delete().eq("workflow_id", id)

    // Insert new steps
    if (body.steps && body.steps.length > 0) {
      const steps = body.steps.map((step: any) => ({
        workflow_id: id,
        step_number: step.step_number,
        delay_hours: step.delay_hours,
        email_subject: step.email_subject,
        email_content: step.email_content,
      }))

      await supabase.from("workflow_steps").insert(steps)
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[Workflow PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("email_workflows").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Workflow DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
