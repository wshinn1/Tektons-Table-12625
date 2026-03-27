import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getResend } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const { tenantId, subject, html, text, newsletterId } = await request.json()

    if (!tenantId || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const resend = getResend()

    const { data: subscribers, error: subError } = await supabase
      .from("tenant_email_subscribers")
      .select("email, name")
      .eq("tenant_id", tenantId)
      .eq("status", "subscribed")

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No subscribers found" }, { status: 400 })
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("email, personal_reply_email")
      .eq("id", tenantId)
      .single()

    const fromEmail = process.env.RESEND_FROM_EMAIL || "hello@tektonstable.com"
    const replyToEmail = tenant?.personal_reply_email || tenant?.email

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const subscriber of subscribers) {
      const emailData: any = {
        from: fromEmail,
        to: subscriber.email,
        subject,
        html,
      }

      if (text) emailData.text = text
      if (replyToEmail) emailData.reply_to = replyToEmail

      const { error: resendError } = await resend.emails.send(emailData)

      if (resendError) {
        console.error(`Resend error sending to ${subscriber.email}:`, resendError)
        errors.push(`${subscriber.email}: ${resendError.message}`)
        failCount++
      } else {
        successCount++
      }
    }

    if (newsletterId) {
      await supabase
        .from("tenant_newsletters")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          recipient_count: successCount,
        })
        .eq("id", newsletterId)
    }

    if (successCount === 0) {
      return NextResponse.json(
        { error: `Failed to send to all ${failCount} recipients`, errors },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      recipients: successCount,
      failed: failCount,
    })
  } catch (error) {
    console.error("Error in /api/newsletters/send:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
