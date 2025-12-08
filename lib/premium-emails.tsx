import { sendEmail, PREMIUM_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"

const BASE_STYLES = `
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
  .container { background-color: #f4f4f4; padding: 40px 0; }
  .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
  .header { padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { padding: 40px 30px; }
  .btn { display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
`

const PURPLE = "#7c3aed"
const GREEN = "#16a34a"
const RED = "#dc2626"
const ORANGE = "#f97316"

function emailWrapper(headerBg: string, title: string, content: string, buttonUrl?: string, buttonText?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: ${headerBg}; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${title}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    ${content}
                    ${
                      buttonUrl && buttonText
                        ? `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${buttonUrl}" style="display: inline-block; padding: 14px 28px; background-color: ${headerBg}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        ${buttonText}
                      </a>
                    </div>
                    `
                        : ""
                    }
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; border-top: 1px solid #eee; text-align: center;">
                    <p style="color: #666666; font-size: 12px; margin: 0;">
                      Tekton's Table | <a href="https://tektonstable.com" style="color: ${PURPLE};">tektonstable.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export async function sendPremiumWelcomeEmail(
  email: string,
  isTrialing: boolean,
  isTenant: boolean,
  trialEndDate?: Date,
) {
  const title = isTrialing ? "Your Premium Resources Trial Has Started!" : "Welcome to Premium Resources!"

  const trialInfo =
    isTrialing && trialEndDate
      ? `
    <div style="background-color: #f5f3ff; border-left: 4px solid ${PURPLE}; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Trial ends:</strong> ${trialEndDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <p style="color: #666666; font-size: 13px; margin: 10px 0 0 0;">
        ${isTenant ? "As a Tekton's Table ministry partner, you get 1 month free!" : "Your trial will automatically convert to $4.99/month."}
      </p>
    </div>
  `
      : ""

  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      ${isTrialing ? "Your premium resources access is now active!" : "Thank you for subscribing to Premium Resources!"}
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      You now have access to all premium articles, guides, and resources on Tekton's Table - over 150,000 words of fundraising wisdom.
    </p>
    ${trialInfo}
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 10px 0;">
      <strong>What you get:</strong>
    </p>
    <ul style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px 0; padding-left: 20px;">
      <li>15+ in-depth fundraising guides</li>
      <li>Exclusive ministry leadership content</li>
      <li>New resources added regularly</li>
      <li>Cancel anytime</li>
    </ul>
  `

  const html = emailWrapper(PURPLE, title, content, "https://tektonstable.com/resources", "Start Reading")

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: title,
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendTrialEndingEmail(email: string, trialEndDate: Date, isTenant: boolean) {
  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Your ${isTenant ? "complimentary " : ""}premium resources trial is ending soon.
    </p>
    <div style="background-color: #fef3c7; border-left: 4px solid ${ORANGE}; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Trial ends:</strong> ${trialEndDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      To keep reading premium resources after your trial, your subscription will continue at <strong>$4.99/month</strong>.
    </p>
    <p style="color: #666666; font-size: 14px; line-height: 22px; margin: 20px 0 0 0;">
      Don't want to continue? You can cancel anytime from your account settings - no questions asked.
    </p>
  `

  const html = emailWrapper(
    ORANGE,
    "Your Trial is Ending Soon",
    content,
    "https://tektonstable.com/resources",
    "Keep Reading",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: "Your Premium Resources Trial Ends in 7 Days",
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendTrialEndedEmail(email: string) {
  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Your trial has ended and your premium subscription is now active!
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      You'll be billed <strong>$4.99/month</strong> to continue accessing all premium resources.
    </p>
    <p style="color: #666666; font-size: 14px; line-height: 22px; margin: 20px 0 0 0;">
      You can manage your subscription anytime from your account settings.
    </p>
  `

  const html = emailWrapper(
    GREEN,
    "Your Subscription is Now Active",
    content,
    "https://tektonstable.com/resources",
    "Continue Reading",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: "Your Premium Resources Subscription is Active",
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendPaymentFailedEmail(email: string, gracePeriodEnd: Date) {
  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      We couldn't process your payment for Premium Resources.
    </p>
    <div style="background-color: #fef2f2; border-left: 4px solid ${RED}; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Grace period ends:</strong> ${gracePeriodEnd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <p style="color: #666666; font-size: 13px; margin: 10px 0 0 0;">
        You have 7 days to update your payment method before losing access.
      </p>
    </div>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Please update your payment method to keep your access to premium resources.
    </p>
  `

  const html = emailWrapper(
    RED,
    "Payment Failed",
    content,
    "https://tektonstable.com/account/subscription",
    "Update Payment Method",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: "Action Required: Payment Failed for Premium Resources",
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendPaymentReminderEmail(email: string, gracePeriodEnd: Date) {
  const daysLeft = Math.ceil((gracePeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      This is a reminder that your payment for Premium Resources is still pending.
    </p>
    <div style="background-color: #fef2f2; border-left: 4px solid ${RED}; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Only ${daysLeft} days left</strong> to update your payment method.
      </p>
    </div>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Don't lose access to your premium resources - update your payment now.
    </p>
  `

  const html = emailWrapper(
    RED,
    "Payment Reminder",
    content,
    "https://tektonstable.com/account/subscription",
    "Update Payment Now",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: `Urgent: ${daysLeft} Days Left to Update Payment`,
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendSubscriptionCanceledEmail(email: string, accessEndDate: Date) {
  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Your Premium Resources subscription has been canceled.
    </p>
    <div style="background-color: #f5f5f5; border-left: 4px solid #666; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Access until:</strong> ${accessEndDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      You'll continue to have access until the end of your current billing period.
    </p>
    <p style="color: #666666; font-size: 14px; line-height: 22px; margin: 20px 0 0 0;">
      Changed your mind? You can resubscribe anytime to regain access.
    </p>
  `

  const html = emailWrapper(
    "#666666",
    "Subscription Canceled",
    content,
    "https://tektonstable.com/account/subscription",
    "Resubscribe",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: "Your Premium Resources Subscription Has Been Canceled",
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendCompAccessGrantedEmail(email: string, expiresAt: Date | null, reason?: string) {
  const isPermanent = !expiresAt

  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Great news! You've been granted ${isPermanent ? "permanent" : "complimentary"} access to Premium Resources.
    </p>
    ${
      reason
        ? `
    <div style="background-color: #f5f3ff; border-left: 4px solid ${PURPLE}; padding: 15px; margin: 20px 0;">
      <p style="color: #666666; font-size: 13px; margin: 0;">
        <strong>Reason:</strong> ${reason}
      </p>
    </div>
    `
        : ""
    }
    ${
      !isPermanent
        ? `
    <div style="background-color: #f0fdf4; border-left: 4px solid ${GREEN}; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Access until:</strong> ${expiresAt!.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
    `
        : ""
    }
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      You now have full access to all premium articles, guides, and resources - over 150,000 words of fundraising wisdom.
    </p>
  `

  const html = emailWrapper(
    PURPLE,
    "Premium Access Granted!",
    content,
    "https://tektonstable.com/resources",
    "Start Reading",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: `You've Been Granted ${isPermanent ? "Lifetime" : "Complimentary"} Premium Access!`,
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}

export async function sendCompExpiringEmail(email: string, expiresAt: Date) {
  const content = `
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      Your complimentary premium access is ending soon.
    </p>
    <div style="background-color: #fef3c7; border-left: 4px solid ${ORANGE}; padding: 15px; margin: 20px 0;">
      <p style="color: #333333; font-size: 14px; margin: 0;">
        <strong>Access ends:</strong> ${expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
    <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
      To keep access to all premium resources, subscribe for just <strong>$4.99/month</strong>.
    </p>
  `

  const html = emailWrapper(
    ORANGE,
    "Your Access is Ending Soon",
    content,
    "https://tektonstable.com/account/subscription",
    "Subscribe Now",
  )

  await sendEmail({
    to: email,
    from: PREMIUM_EMAIL,
    subject: "Your Premium Access Ends in 7 Days",
    html,
    replyTo: REPLY_TO_EMAIL,
  })
}
