export const EMAIL_TEMPLATES = {
  contactSubmissionToTenant: ({
    tenantName,
    submitterName,
    submitterEmail,
    subject,
    message,
  }: {
    tenantName: string
    submitterName: string
    submitterEmail: string
    subject: string
    message: string
  }) => ({
    subject: `New Contact Form Submission: ${subject}`,
    html: `
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
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">New Contact Form Submission</h1>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hello ${tenantName}, you have received a new message from your website contact form.
                      </p>
                      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #333333;"><strong>From:</strong> ${submitterName}</p>
                        <p style="margin: 0 0 10px 0; color: #333333;"><strong>Email:</strong> ${submitterEmail}</p>
                        <p style="margin: 0 0 10px 0; color: #333333;"><strong>Subject:</strong> ${subject}</p>
                        <p style="margin: 0; color: #333333;"><strong>Message:</strong></p>
                        <p style="margin: 10px 0 0 0; color: #666666; white-space: pre-wrap;">${message}</p>
                      </div>
                      <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                        You can reply directly to this email to respond to ${submitterName}.
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

  contactSubmissionConfirmation: ({
    submitterName,
    tenantName,
    message,
  }: {
    submitterName: string
    tenantName: string
    message: string
  }) => ({
    subject: `We received your message`,
    html: `
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
                    <td style="padding: 40px 30px;">
                      <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Thank You for Reaching Out</h1>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hi ${submitterName},
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        We received your message and ${tenantName} will get back to you as soon as possible.
                      </p>
                      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #333333;"><strong>Your message:</strong></p>
                        <p style="margin: 0; color: #666666; white-space: pre-wrap;">${message}</p>
                      </div>
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

  donorAccountInvitation: ({
    donorName,
    tenantName,
    amount,
    signupLink,
  }: {
    donorName: string
    tenantName: string
    amount: number
    signupLink: string
  }) => ({
    subject: `Track Your Support for ${tenantName}`,
    html: `
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
                    <td style="padding: 40px 30px; text-align: center; background-color: #007bff; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Thank You for Your Support!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hi ${donorName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Thank you for your generous donation of $${amount.toFixed(2)} to <strong>${tenantName}</strong>!
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        We've created a donor portal where you can:
                      </p>
                      <ul style="color: #666666; font-size: 16px; line-height: 28px; margin: 0 0 30px 0; padding-left: 20px;">
                        <li>View your complete donation history</li>
                        <li>Manage and cancel recurring payments</li>
                        <li>Track all missionaries you support</li>
                        <li>Update your payment methods</li>
                        <li>Download tax receipts</li>
                      </ul>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${signupLink}" style="display: inline-block; padding: 14px 32px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                              Create Your Donor Account
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 20px 0 0 0; text-align: center;">
                        This link will expire in 7 days. If you have any questions, please reply to this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="color: #999999; font-size: 14px; margin: 0;">
                        © ${new Date().getFullYear()} TektonsTable. All rights reserved.
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
    tenantName,
    amount,
    isRecurring,
    frequency,
    date,
    isTaxDeductible,
    nonprofitEIN,
    donorPortalUrl,
  }: {
    donorName: string
    tenantName: string
    amount: number
    isRecurring: boolean
    frequency?: string
    date: string
    isTaxDeductible: boolean
    nonprofitEIN?: string
    donorPortalUrl?: string
  }) => ({
    subject: `Thank you for your ${isRecurring ? "recurring " : ""}donation to ${tenantName}`,
    html: `
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
                    <td style="padding: 40px 30px; text-align: center; background-color: #28a745; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Donation Receipt</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Dear ${donorName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Thank you for your generous ${isRecurring ? frequency + " recurring " : ""}donation to ${tenantName}.
                      </p>
                      <div style="background-color: #f8f8f8; padding: 20px; border-radius: 4px; margin: 20px 0;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Donation Amount:</td>
                            <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">$${amount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Date:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${date}</td>
                          </tr>
                          ${
                            isRecurring
                              ? `<tr>
                            <td style="color: #666666; font-size: 14px;">Frequency:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${frequency}</td>
                          </tr>`
                              : ""
                          }
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Recipient:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${tenantName}</td>
                          </tr>
                        </table>
                      </div>
                      ${
                        isTaxDeductible && nonprofitEIN
                          ? `
                        <div style="background-color: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                          <p style="color: #333333; font-size: 14px; line-height: 20px; margin: 0 0 10px 0;">
                            <strong>Tax Deductible Information</strong>
                          </p>
                          <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0;">
                            This donation is tax-deductible. EIN: ${nonprofitEIN}
                          </p>
                          <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 10px 0 0 0;">
                            Please consult your tax advisor for specific guidance on your deduction.
                          </p>
                        </div>
                      `
                          : `
                        <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                          This donation is not tax-deductible as the recipient is not a registered 501(c)(3) nonprofit organization.
                        </p>
                      `
                      }
                      ${
                        donorPortalUrl
                          ? `
                      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                        <p style="color: #333333; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">
                          Track Your Giving
                        </p>
                        <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 0 0 20px 0;">
                          Create a donor account to view your giving history, manage recurring donations, and download tax receipts.
                        </p>
                        <a href="${donorPortalUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Sign Up or Log In
                        </a>
                      </div>
                      `
                          : ""
                      }
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 30px 0 0 0;">
                        Your generosity makes a real difference. Thank you for your continued support!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
                        <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">
                          Powered by <a href="https://tektonstable.com?ref=donation-receipt" style="color: #28a745; text-decoration: none; font-weight: bold;">TektonsTable</a>
                        </p>
                        <p style="color: #888888; font-size: 12px; margin: 0;">
                          The all-in-one platform for missionaries to share their story, connect with supporters, and receive donations.
                        </p>
                        <a href="https://tektonstable.com?ref=donation-receipt" style="display: inline-block; margin-top: 10px; color: #28a745; font-size: 13px; text-decoration: none;">
                          Learn more &rarr;
                        </a>
                      </div>
                      <p style="color: #999999; font-size: 14px; margin: 0;">
                        © ${new Date().getFullYear()} TektonsTable. All rights reserved.
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
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background-color: #007bff; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Our Community!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hi ${subscriberName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Thank you for subscribing to ${tenantName}'s updates! You'll now receive email notifications when new content is posted.
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        You can also support this missionary financially by making a donation at any time.
                      </p>
                      ${
                        latestPostTitle && latestPostUrl
                          ? `
                        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 4px; margin: 20px 0;">
                          <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Latest Post:</p>
                          <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">${latestPostTitle}</h3>
                          <a href="${latestPostUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">
                            Read Now
                          </a>
                        </div>
                      `
                          : ""
                      }
                      <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                        You can manage your subscription preferences anytime from your account dashboard.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="color: #999999; font-size: 14px; margin: 0;">
                        © ${new Date().getFullYear()} TektonsTable. All rights reserved.
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

  campaignDonationNotification: ({
    tenantName,
    campaignTitle,
    donorName,
    amount,
    isRecurring,
    frequency,
    campaignUrl,
    isAnonymous,
  }: {
    tenantName: string
    campaignTitle: string
    donorName: string
    amount: number
    isRecurring: boolean
    frequency?: string
    campaignUrl: string
    isAnonymous: boolean
  }) => ({
    subject: `New ${isRecurring ? "recurring " : ""}donation to ${campaignTitle}`,
    html: `
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
                    <td style="padding: 40px 30px; text-align: center; background-color: #16a34a; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 New Campaign Donation!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hi ${tenantName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Great news! ${isAnonymous ? "Someone" : donorName} just made a ${isRecurring ? frequency + " recurring " : ""}donation to your campaign <strong>${campaignTitle}</strong>.
                      </p>
                      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Donor:</td>
                            <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">
                              ${isAnonymous ? "Anonymous" : donorName}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Amount:</td>
                            <td style="color: #16a34a; font-size: 18px; font-weight: bold; text-align: right;">$${amount.toFixed(2)}</td>
                          </tr>
                          ${
                            isRecurring
                              ? `<tr>
                            <td style="color: #666666; font-size: 14px;">Frequency:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${frequency}</td>
                          </tr>`
                              : ""
                          }
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Campaign:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${campaignTitle}</td>
                          </tr>
                        </table>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${campaignUrl}" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                              View Campaign
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 20px 0 0 0;">
                        Keep up the great work! Your campaign is making a difference.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="color: #999999; font-size: 14px; margin: 0;">
                        © ${new Date().getFullYear()} TektonsTable. All rights reserved.
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

  campaignDailyDigest: ({
    tenantName,
    campaigns,
    totalAmount,
    totalDonations,
    date,
  }: {
    tenantName: string
    campaigns: Array<{
      title: string
      donationCount: number
      totalAmount: number
      url: string
    }>
    totalAmount: number
    totalDonations: number
    date: string
  }) => ({
    subject: `Your daily campaign update - ${totalDonations} new donation${totalDonations !== 1 ? "s" : ""}`,
    html: `
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
                    <td style="padding: 40px 30px; text-align: center; background-color: #16a34a; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📊 Daily Campaign Report</h1>
                      <p style="color: #e0f2e9; margin: 10px 0 0 0; font-size: 14px;">${date}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Hi ${tenantName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Here's your daily summary of campaign donations received yesterday:
                      </p>
                      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <table width="100%" cellpadding="10" cellspacing="0">
                          <tr>
                            <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #dcfce7;">Total Donations:</td>
                            <td style="color: #16a34a; font-size: 20px; font-weight: bold; text-align: right; border-bottom: 1px solid #dcfce7;">
                              ${totalDonations}
                            </td>
                          </tr>
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Total Amount:</td>
                            <td style="color: #16a34a; font-size: 20px; font-weight: bold; text-align: right;">
                              $${totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <h2 style="color: #333333; font-size: 18px; margin: 30px 0 15px 0;">Campaign Breakdown:</h2>
                      
                      ${campaigns
                        .map(
                          (campaign) => `
                        <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; margin: 10px 0;">
                          <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">${campaign.title}</h3>
                          <table width="100%" cellpadding="5" cellspacing="0">
                            <tr>
                              <td style="color: #666666; font-size: 14px;">Donations:</td>
                              <td style="color: #333333; font-size: 14px; text-align: right;">${campaign.donationCount}</td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;">Amount:</td>
                              <td style="color: #16a34a; font-size: 16px; font-weight: bold; text-align: right;">
                                $${campaign.totalAmount.toFixed(2)}
                              </td>
                            </tr>
                          </table>
                          <div style="text-align: center; margin-top: 10px;">
                            <a href="${campaign.url}" style="display: inline-block; padding: 8px 16px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">
                              View Campaign
                            </a>
                          </div>
                        </div>
                      `,
                        )
                        .join("")}
                      
                      <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                        Keep up the amazing work! Your campaigns are making a real impact.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                        You're receiving this daily digest because you've enabled daily campaign notifications.
                      </p>
                      <p style="color: #999999; font-size: 14px; margin: 0;">
                        © ${new Date().getFullYear()} TektonsTable. All rights reserved.
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

  campaignDonationReceipt: ({
    donorName,
    campaignTitle,
    tenantName,
    amount,
    isRecurring,
    frequency,
    date,
    campaignUrl,
  }: {
    donorName: string
    campaignTitle: string
    tenantName: string
    amount: number
    isRecurring: boolean
    frequency?: string
    date: string
    campaignUrl: string
  }) => ({
    subject: `Thank you for supporting ${campaignTitle}`,
    html: `
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
                    <td style="padding: 40px 30px; text-align: center; background-color: #16a34a; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Campaign Donation Receipt</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        Dear ${donorName},
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Thank you for your generous ${isRecurring ? frequency + " recurring " : ""}donation to <strong>${campaignTitle}</strong> supporting ${tenantName}.
                      </p>
                      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 4px; margin: 20px 0;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Donation Amount:</td>
                            <td style="color: #16a34a; font-size: 18px; font-weight: bold; text-align: right;">$${amount.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Date:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${date}</td>
                          </tr>
                          ${
                            isRecurring
                              ? `<tr>
                            <td style="color: #666666; font-size: 14px;">Frequency:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${frequency}</td>
                          </tr>`
                              : ""
                          }
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Campaign:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${campaignTitle}</td>
                          </tr>
                          <tr>
                            <td style="color: #666666; font-size: 14px;">Recipient:</td>
                            <td style="color: #333333; font-size: 14px; text-align: right;">${tenantName}</td>
                          </tr>
                        </table>
                      </div>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${campaignUrl}" style="display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                              View Campaign Progress
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 30px 0 0 0;">
                        Your support is making a real difference. Thank you for being part of this campaign!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
                        <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">
                          Powered by <a href="https://tektonstable.com?ref=donation-receipt" style="color: #28a745; text-decoration: none; font-weight: bold;">TektonsTable</a>
                        </p>
                        <p style="color: #888888; font-size: 12px; margin: 0;">
                          The all-in-one platform for missionaries to share their story, connect with supporters, and receive donations.
                        </p>
                        <a href="https://tektonstable.com?ref=donation-receipt" style="display: inline-block; margin-top: 10px; color: #28a745; font-size: 13px; text-decoration: none;">
                          Learn more &rarr;
                        </a>
                      </div>
                      <p style="color: #999999; font-size: 14px; margin: 0;">
                        © ${new Date().getFullYear()} TektonsTable. All rights reserved.
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
