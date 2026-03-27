import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getResend } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const { email, subject, content, tenantId } = await request.json()

    if (!email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const resend = getResend()

    // Look up tenant display name if tenantId provided
    let displayName: string | null = null
    if (tenantId) {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("newsletter_from_name, full_name")
        .eq("id", tenantId)
        .single()
      displayName = tenant?.newsletter_from_name || tenant?.full_name || null
    }

    const baseEmail = process.env.RESEND_FROM_EMAIL || "hello@tektonstable.com"
    const fromEmail = displayName ? `${displayName} <${baseEmail}>` : baseEmail

    const { data, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[TEST] ${subject}`,
      html: content,
    })

    if (resendError) {
      console.error("Resend error sending test email:", resendError)
      return NextResponse.json({ error: resendError.message || "Failed to send test email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
