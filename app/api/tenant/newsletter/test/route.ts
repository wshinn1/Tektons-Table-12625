import { NextResponse } from "next/server"
import { getResend } from "@/lib/resend"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Test email request body:", body)

    const { tenant_id, subject, content, test_email } = body

    if (!test_email || !subject || !content) {
      console.error("[v0] Missing required fields:", { test_email, subject: !!subject, content: !!content })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let replyToEmail: string | undefined

    if (tenant_id) {
      const supabase = await createServerClient()
      const { data: tenant } = await supabase
        .from("tenants")
        .select("email, subdomain, personal_reply_email")
        .eq("id", tenant_id)
        .single()

      if (!tenant) {
        console.error("[v0] Tenant not found:", tenant_id)
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
      }

      // Use personal_reply_email if set, otherwise use tenant email
      replyToEmail = tenant.personal_reply_email || tenant.email

      console.log("[v0] Sending test email for tenant:", tenant.subdomain, "reply-to:", replyToEmail)
    }

    const emailData: any = {
      from: "hello@tektonstable.com",
      to: test_email,
      subject: `[TEST] ${subject}`,
      html: content,
    }

    if (replyToEmail) {
      emailData.reply_to = replyToEmail
    }

    const resend = getResend()
    const result = await resend.emails.send(emailData)

    console.log("[v0] Test email sent successfully:", result)

    return NextResponse.json({ success: true, emailId: result.data?.id })
  } catch (error: any) {
    console.error("[v0] Error sending test email:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
