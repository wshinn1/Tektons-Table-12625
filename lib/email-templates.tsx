export const EMAIL_TEMPLATES = {
  welcomeSubscriber: ({
    subscriberName,
    tenantName,
    tenantSlug,
    latestPostTitle,
    latestPostUrl,
  }: {
    subscriberName: string
    tenantName: string
    tenantSlug: string
    latestPostTitle?: string
    latestPostUrl?: string
  }) => ({
    subject: `Welcome to ${tenantName}'s Community!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${tenantName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to the Community!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi ${subscriberName},
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for subscribing to <strong>${tenantName}</strong>! You'll now receive updates about new posts, ministry news, and ways to get involved.
              </p>
              
              ${
                latestPostTitle && latestPostUrl
                  ? `
              <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px;">Latest Post</p>
                <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1e3a5f;">${latestPostTitle}</p>
                <a href="${latestPostUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Read Now</a>
              </div>
              `
                  : ""
              }
              
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #92400e;">Support This Ministry</p>
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #78350f;">
                  Consider making a donation to support ${tenantName}'s mission and ministry work.
                </p>
                <a href="https://${tenantSlug}.tektonstable.com/giving" style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Give Now</a>
              </div>
              
              <!-- Updated Tekton's Table introduction to focus on long-term sustainable fundraising -->
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #374151;">About Tekton's Table</p>
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #4b5563;">
                  Tekton's Table is a platform dedicated to building long-term, sustainable fundraising for people working to reach their goals and accomplish their calling to positively impact the world. We provide the tools and community to help turn vision into lasting change.
                </p>
                <a href="https://tektonstable.com" style="display: inline-block; background-color: #1e3a5f; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">Learn More About Tekton's Table</a>
              </div>
              
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                You can reply directly to this email to reach ${tenantName}.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; text-align: center;">
                You're receiving this because you subscribed to ${tenantName}'s updates.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                <a href="https://${tenantSlug}.tektonstable.com/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #d1d5db; text-align: center;">
                Powered by <a href="https://tektonstable.com" style="color: #9ca3af; text-decoration: none;">TektonsTable</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  donationReceipt: ({
    donorName,
    donorEmail,
    amount,
    currency,
    tenantName,
    tenantSlug,
    donationDate,
    transactionId,
    isRecurring,
    donationType,
  }: {
    donorName: string
    donorEmail: string
    amount: number
    currency: string
    tenantName: string
    tenantSlug: string
    donationDate: string
    transactionId: string
    isRecurring: boolean
    donationType?: string
  }) => ({
    subject: `Thank you for your ${isRecurring ? "monthly " : ""}gift to ${tenantName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 40px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 28px;">❤️</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Thank You!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your generosity makes a difference</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Dear ${donorName},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for your ${isRecurring ? "monthly " : ""}gift to <strong>${tenantName}</strong>. Your support helps further the mission and ministry work.
              </p>
              
              <!-- Receipt Details -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Donation Receipt</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #6b7280; font-size: 14px;">Amount</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      <span style="color: #111827; font-size: 18px; font-weight: 700;">${currency || "$"}${(amount / 100).toFixed(2)}</span>
                      ${isRecurring ? '<span style="color: #10b981; font-size: 12px; margin-left: 8px;">Monthly</span>' : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #6b7280; font-size: 14px;">Date</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      <span style="color: #111827; font-size: 14px;">${donationDate || new Date().toLocaleDateString()}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #6b7280; font-size: 14px;">Recipient</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      <span style="color: #111827; font-size: 14px;">${tenantName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #6b7280; font-size: 14px;">Transaction ID</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #6b7280; font-size: 12px; font-family: monospace;">${transactionId || "N/A"}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 13px; color: #1e40af;">
                  <strong>Tax Information:</strong> This donation may be tax-deductible. Please consult with your tax advisor. No goods or services were provided in exchange for this contribution.
                </p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://${tenantSlug}.tektonstable.com/auth/donor-login" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">View Your Giving History</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; text-align: center;">
                Questions about your donation? Reply to this email or contact ${tenantName}.
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #d1d5db; text-align: center;">
                Powered by <a href="https://tektonstable.com" style="color: #9ca3af; text-decoration: none;">TektonsTable</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  newBlogPost: ({
    subscriberName,
    tenantName,
    tenantSlug,
    postTitle,
    postExcerpt,
    postUrl,
    postImageUrl,
  }: {
    subscriberName: string
    tenantName: string
    tenantSlug: string
    postTitle: string
    postExcerpt: string
    postUrl: string
    postImageUrl?: string
  }) => ({
    subject: `New Post from ${tenantName}: ${postTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Post from ${tenantName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 24px 40px;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">${tenantName}</p>
            </td>
          </tr>
          
          ${
            postImageUrl
              ? `
          <tr>
            <td>
              <img src="${postImageUrl}" alt="${postTitle}" width="600" style="display: block; width: 100%; height: auto;">
            </td>
          </tr>
          `
              : ""
          }
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px;">New Post</p>
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #111827; line-height: 1.3;">${postTitle}</h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4b5563;">${postExcerpt}</p>
              
              <a href="${postUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">Read Full Post</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; text-align: center;">
                You're receiving this because you subscribed to ${tenantName}'s updates.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                <a href="https://${tenantSlug}.tektonstable.com/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #d1d5db; text-align: center;">
                Powered by <a href="https://tektonstable.com" style="color: #9ca3af; text-decoration: none;">TektonsTable</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  passwordReset: ({
    userName,
    resetUrl,
  }: {
    userName: string
    resetUrl: string
  }) => ({
    subject: "Reset Your Password",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 40px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Password Reset</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi ${userName},
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #374151;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">Reset Password</a>
              </div>
              
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Powered by <a href="https://tektonstable.com" style="color: #9ca3af; text-decoration: none;">TektonsTable</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
}
