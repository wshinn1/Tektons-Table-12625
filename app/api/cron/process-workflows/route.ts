import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getResend } from "@/lib/resend"

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createServerClient()
    const resend = getResend()

    console.log("[v0] Starting workflow processing...")

    // Get all enrollments that need processing
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("workflow_enrollments")
      .select(
        `
        *,
        email_workflows (*),
        contacts (*)
      `,
      )
      .eq("status", "active")
      .or("next_email_due_at.is.null,next_email_due_at.lte." + new Date().toISOString())

    if (enrollmentsError) throw enrollmentsError

    console.log(`[v0] Found ${enrollments?.length || 0} enrollments to process`)

    let processed = 0
    let sent = 0
    let errors = 0

    for (const enrollment of enrollments || []) {
      try {
        // Get the current step
        const workflow = enrollment.email_workflows
        const contact = enrollment.contacts

        const { data: steps, error: stepsError } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("workflow_id", enrollment.workflow_id)
          .order("step_number", { ascending: true })

        if (stepsError) throw stepsError

        if (!workflow?.is_active) {
          console.log(`[v0] Workflow ${workflow?.name} is inactive, skipping`)
          continue
        }

        const currentStep = steps?.find((s: any) => s.step_number === enrollment.current_step)

        if (!currentStep) {
          // No more steps, mark as completed
          await supabase
            .from("workflow_enrollments")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", enrollment.id)

          console.log(`[v0] Enrollment ${enrollment.id} completed`)
          processed++
          continue
        }

        // Send email
        console.log(`[v0] Sending step ${currentStep.step_number} to ${contact.email}`)

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: contact.email,
          subject: currentStep.email_subject,
          html: currentStep.email_content,
        })

        if (emailError) throw emailError

        // Record the send
        await supabase.from("workflow_email_sends").insert({
          enrollment_id: enrollment.id,
          step_id: currentStep.id,
          contact_id: contact.id,
          resend_message_id: emailData?.id,
          status: "sent",
        })

        // Move to next step
        const nextStepNumber = enrollment.current_step + 1
        const nextStep = steps?.find((s: any) => s.step_number === nextStepNumber)

        let nextEmailDueAt = null
        if (nextStep) {
          // Calculate when the next email should be sent
          const delayMs = nextStep.delay_hours * 60 * 60 * 1000
          nextEmailDueAt = new Date(Date.now() + delayMs).toISOString()
        }

        await supabase
          .from("workflow_enrollments")
          .update({
            current_step: nextStepNumber,
            last_email_sent_at: new Date().toISOString(),
            next_email_due_at: nextEmailDueAt,
            status: nextStep ? "active" : "completed",
            completed_at: nextStep ? null : new Date().toISOString(),
          })
          .eq("id", enrollment.id)

        sent++
        processed++
        console.log(`[v0] Successfully sent email for enrollment ${enrollment.id}`)
      } catch (error) {
        console.error(`[v0] Error processing enrollment ${enrollment.id}:`, error)

        const { data: firstStep } = await supabase
          .from("workflow_steps")
          .select("id")
          .eq("workflow_id", enrollment.workflow_id)
          .order("step_number", { ascending: true })
          .limit(1)
          .single()

        // Record error
        await supabase.from("workflow_email_sends").insert({
          enrollment_id: enrollment.id,
          step_id: firstStep?.id,
          contact_id: enrollment.contact_id,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })

        errors++
      }
    }

    console.log(`[v0] Workflow processing complete: ${processed} processed, ${sent} sent, ${errors} errors`)

    return NextResponse.json({
      success: true,
      processed,
      sent,
      errors,
    })
  } catch (error) {
    console.error("[Cron Process Workflows]", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 },
    )
  }
}
