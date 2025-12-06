import { Resend } from "resend"

let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set. Please add it to your environment variables.")
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export async function sendEmail({
  to,
  from,
  subject,
  html,
  replyTo,
  cc,
}: {
  to: string | string[]
  from: string
  subject: string
  html: string
  replyTo?: string
  cc?: string[]
}) {
  const resend = getResend()
  return await resend.emails.send({
    to,
    from,
    subject,
    html,
    reply_to: replyTo,
    cc,
  })
}

// For backward compatibility, export a getter
export const resend = {
  get emails() {
    return getResend().emails
  },
}

export const FROM_EMAIL = "updates@tektonstable.com"
export const REPLY_TO_EMAIL = "support@tektonstable.com"
export const GIVING_EMAIL = "giving@tektonstable.com"
