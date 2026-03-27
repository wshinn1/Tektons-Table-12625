import { type NextRequest, NextResponse } from "next/server"
import { getResend } from "@/lib/resend"

export async function POST(request: NextRequest) {
  try {
    const { email, subject, content } = await request.json()

    if (!email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const resend = getResend()

    const { data, error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "hello@tektonstable.com",
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
