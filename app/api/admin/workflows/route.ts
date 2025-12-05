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

    const { data: workflows, error } = await supabase
      .from("email_workflows")
      .select(
        `
        *,
        workflow_steps (count),
        workflow_enrollments (count)
      `,
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform data
    const workflowsWithCounts = workflows?.map((workflow: any) => ({
      ...workflow,
      step_count: workflow.workflow_steps?.[0]?.count || 0,
      enrollment_count: workflow.workflow_enrollments?.[0]?.count || 0,
      workflow_steps: undefined,
      workflow_enrollments: undefined,
    }))

    return NextResponse.json(workflowsWithCounts)
  } catch (error) {
    console.error("[Workflows GET]", error)
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

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("email_workflows")
      .insert({
        name: body.name,
        description: body.description,
        trigger_type: body.trigger_type,
        is_active: false, // Start inactive
      })
      .select()
      .single()

    if (workflowError) throw workflowError

    // Insert steps
    if (body.steps && body.steps.length > 0) {
      const steps = body.steps.map((step: any) => ({
        workflow_id: workflow.id,
        step_number: step.step_number,
        delay_hours: step.delay_hours,
        email_subject: step.email_subject,
        email_content: step.email_content,
      }))

      const { error: stepsError } = await supabase.from("workflow_steps").insert(steps)

      if (stepsError) throw stepsError
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[Workflows POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
