import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, subject, content } = await request.json()

    if (!email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "hello@tektonstable.com",
      to: email,
      subject: `[TEST] ${subject}`,
      html: content,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
