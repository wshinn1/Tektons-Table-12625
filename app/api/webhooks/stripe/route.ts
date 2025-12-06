import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, GIVING_EMAIL, REPLY_TO_EMAIL } from "@/lib/resend"
import { EMAIL_TEMPLATES } from "@/lib/email-templates"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  const webhookSecrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter(
    Boolean,
  ) as string[]

  if (webhookSecrets.length === 0) {
    console.error("[v0] No Stripe webhook secret configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  if (!signature) {
    console.error("[v0] No Stripe signature in request")
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event | null = null
  let lastError: any = null

  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret)
      console.log("[v0] Webhook signature verified with secret")
      break
    } catch (err: any) {
      lastError = err
      console.log("[v0] Signature verification failed with secret, trying next...")
    }
  }

  if (!event) {
    console.error("[v0] Webhook signature verification failed with all secrets:", lastError?.message)
    console.error("[v0] Available secrets count:", webhookSecrets.length)
    console.error("[v0] Signature received:", signature?.substring(0, 50) + "...")
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  console.log("[v0] Received Stripe webhook event:", event.type)
  if (event.account) {
    console.log("[v0] Event from connected account:", event.account)
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        let fullSession = session
        if (event.account) {
          try {
            fullSession = await stripe.checkout.sessions.retrieve(session.id, {
              stripeAccount: event.account,
            })
            console.log("[v0] Retrieved full session from connected account")
            console.log("[v0] Full session metadata:", fullSession.metadata)
          } catch (retrieveError) {
            console.error("[v0] Error retrieving full session:", retrieveError)
          }
        }
        await handleCheckoutCompleted(fullSession, event.account)
        break
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }
      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, connectedAccountId?: string) {
  const supabaseAdmin = createAdminClient()

  console.log("[v0] Processing checkout.session.completed:", session.id)
  console.log("[v0] Session metadata:", session.metadata)
  console.log("[v0] Connected account ID from event:", connectedAccountId)

  const metadata = session.metadata || {}
  let tenantId = metadata.tenant_id

  if (!tenantId && connectedAccountId) {
    console.log("[v0] No tenant_id in metadata, looking up by stripe_account_id:", connectedAccountId)
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("stripe_account_id", connectedAccountId)
      .single()

    if (tenant) {
      tenantId = tenant.id
      console.log("[v0] Found tenant by stripe_account_id:", tenantId)
    } else {
      console.error("[v0] Could not find tenant by stripe_account_id:", tenantError)
    }
  }

  const donationAmount =
    Number.parseFloat(metadata.donation_amount || "0") || (session.amount_total ? session.amount_total / 100 : 0)
  const tipAmount = Number.parseFloat(metadata.tip_amount || "0")
  const totalAmount =
    Number.parseFloat(metadata.total_amount || "0") || (session.amount_total ? session.amount_total / 100 : 0)
  const feeModel = metadata.fee_model || "donor_tips"
  const campaignId = metadata.campaign_id || null
  const authenticatedUserId = metadata.authenticated_user_id || null

  console.log("[v0] Parsed donation data - tenantId:", tenantId, "amount:", donationAmount, "totalAmount:", totalAmount)

  if (!tenantId) {
    console.error("[v0] No tenant_id found - cannot process donation")
    return
  }

  const customerEmail = session.customer_details?.email || session.customer_email
  const customerName = session.customer_details?.name || "Anonymous"

  console.log("[v0] Customer info - email:", customerEmail, "name:", customerName)

  // Calculate platform fee - always 3.5%
  const platformFee = (donationAmount * 3.5) / 100

  // Find or create supporter
  let supporterId = null
  if (customerEmail) {
    // Check if supporter exists
    const { data: existingSupporter, error: supporterLookupError } = await supabaseAdmin
      .from("tenant_financial_supporters")
      .select("id, total_given")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .single()

    if (supporterLookupError && supporterLookupError.code !== "PGRST116") {
      console.error("[v0] Error looking up supporter:", supporterLookupError)
    }

    if (existingSupporter) {
      supporterId = existingSupporter.id
      console.log("[v0] Found existing supporter:", supporterId)
      // Update supporter totals
      const { error: updateError } = await supabaseAdmin
        .from("tenant_financial_supporters")
        .update({
          total_given: (existingSupporter.total_given || 0) + donationAmount,
          last_gift_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", supporterId)

      if (updateError) {
        console.error("[v0] Error updating supporter:", updateError)
      }
    } else {
      // Create new supporter
      console.log("[v0] Creating new supporter for tenant:", tenantId)
      const { data: newSupporter, error: createError } = await supabaseAdmin
        .from("tenant_financial_supporters")
        .insert({
          tenant_id: tenantId,
          email: customerEmail,
          name: customerName,
          total_given: donationAmount,
          first_gift_at: new Date().toISOString(),
          last_gift_at: new Date().toISOString(),
          user_id: authenticatedUserId || null,
          stripe_customer_id: (session.customer as string) || null,
          monthly_amount: session.mode === "subscription" ? donationAmount : 0,
        })
        .select("id")
        .single()

      if (createError) {
        console.error("[v0] Error creating supporter:", createError)
      } else {
        supporterId = newSupporter?.id
        console.log("[v0] Created new supporter:", supporterId)
      }
    }
  }

  // Record the donation
  const isRecurring = session.mode === "subscription"

  const donationData = {
    tenant_id: tenantId,
    supporter_id: supporterId,
    amount: donationAmount,
    type: isRecurring ? "recurring" : "one_time",
    status: "completed",
    stripe_payment_id: (session.payment_intent as string) || session.id,
    stripe_subscription_id: (session.subscription as string) || null,
    donated_at: new Date().toISOString(),
  }

  console.log("[v0] Inserting donation with data:", JSON.stringify(donationData, null, 2))

  const { data: insertedDonation, error: donationError } = await supabaseAdmin
    .from("tenant_donations")
    .insert(donationData)
    .select("id")
    .single()

  if (donationError) {
    console.error("[v0] Error inserting donation:", donationError)
    console.error("[v0] Donation error details:", JSON.stringify(donationError, null, 2))
  } else {
    console.log("[v0] Donation recorded successfully with id:", insertedDonation?.id)
  }

  // If there's a campaign, update campaign donations
  if (campaignId) {
    const { error: campaignDonationError } = await supabaseAdmin.from("campaign_donations").insert({
      campaign_id: campaignId,
      amount: donationAmount,
    })

    if (campaignDonationError) {
      console.error("[v0] Error inserting campaign donation:", campaignDonationError)
    }

    const { data: campaign } = await supabaseAdmin
      .from("tenant_campaigns")
      .select("current_amount")
      .eq("id", campaignId)
      .single()

    if (campaign) {
      await supabaseAdmin
        .from("tenant_campaigns")
        .update({
          current_amount: (campaign.current_amount || 0) + donationAmount,
        })
        .eq("id", campaignId)
    }
  }

  // Update tenant's total donations
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from("tenants")
    .select("total_donations, total_platform_fees, full_name, subdomain")
    .eq("id", tenantId)
    .single()

  if (tenantError) {
    console.error("[v0] Error fetching tenant:", tenantError)
  }

  if (tenant) {
    await supabaseAdmin
      .from("tenants")
      .update({
        total_donations: (tenant.total_donations || 0) + donationAmount,
        total_platform_fees: (tenant.total_platform_fees || 0) + platformFee,
        last_donation_at: new Date().toISOString(),
      })
      .eq("id", tenantId)
  }

  // Update tenant giving settings fundraising amount if applicable
  const { data: givingSettings } = await supabaseAdmin
    .from("tenant_giving_settings")
    .select("fundraising_start_amount")
    .eq("tenant_id", tenantId)
    .single()

  if (givingSettings) {
    await supabaseAdmin
      .from("tenant_giving_settings")
      .update({
        fundraising_start_amount: (givingSettings.fundraising_start_amount || 0) + donationAmount,
      })
      .eq("tenant_id", tenantId)
  }

  // Send receipt email to donor
  if (customerEmail && tenant) {
    try {
      let donorPortalUrl: string | undefined
      if (tenant.subdomain) {
        donorPortalUrl = `https://${tenant.subdomain}.tektonstable.com/auth/donor-login`
      }

      const receiptEmail = EMAIL_TEMPLATES.donationReceipt({
        donorName: customerName,
        tenantName: tenant.full_name || "the missionary",
        amount: donationAmount,
        isRecurring,
        frequency: isRecurring ? "monthly" : undefined,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        isTaxDeductible: false,
        nonprofitEIN: undefined,
        donorPortalUrl,
      })

      await sendEmail({
        to: customerEmail,
        from: GIVING_EMAIL,
        subject: receiptEmail.subject,
        html: receiptEmail.html,
        replyTo: REPLY_TO_EMAIL,
      })

      console.log("[v0] Donation receipt email sent to:", customerEmail)
    } catch (emailError) {
      console.error("[v0] Failed to send donation receipt email:", emailError)
    }
  }

  // Send notification email to tenant
  try {
    const { data: tenantUser } = await supabaseAdmin.from("users").select("email").eq("id", tenantId).single()

    if (tenantUser?.email) {
      const isAnonymous = metadata.anonymous === "true"
      const notificationHtml = `
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
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Donation Received!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333333; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                          Great news! You just received a ${isRecurring ? "monthly recurring " : ""}donation.
                        </p>
                        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="color: #666666; font-size: 14px;">From:</td>
                              <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">
                                ${isAnonymous ? "Anonymous" : customerName}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #666666; font-size: 14px;">Amount:</td>
                              <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">$${donationAmount.toFixed(2)}</td>
                            </tr>
                            ${isRecurring ? `<tr><td style="color: #666666; font-size: 14px;">Type:</td><td style="color: #333333; font-size: 14px; text-align: right;">Monthly Recurring</td></tr>` : ""}
                          </table>
                        </div>
                        <p style="color: #666666; font-size: 14px; margin: 20px 0 0 0;">
                          Thank you for the work you do!
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

      await sendEmail({
        to: tenantUser.email,
        from: GIVING_EMAIL,
        subject: `New ${isRecurring ? "recurring " : ""}donation: $${donationAmount.toFixed(2)}`,
        html: notificationHtml,
        replyTo: REPLY_TO_EMAIL,
      })

      console.log("[v0] Donation notification email sent to tenant:", tenantUser.email)
    }
  } catch (tenantEmailError) {
    console.error("[v0] Failed to send tenant notification email:", tenantEmailError)
  }

  console.log("[v0] Checkout completed processing finished for tenant:", tenantId)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabaseAdmin = createAdminClient()

  console.log("[v0] Processing invoice.paid:", invoice.id)

  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const metadata = invoice.subscription_details?.metadata || {}
  const tenantId = metadata.tenant_id
  const donationAmount = Number.parseFloat(metadata.donation_amount || "0")
  const campaignId = metadata.campaign_id || null

  if (!tenantId || !donationAmount) {
    console.log("[v0] Missing tenant_id or donation_amount in subscription metadata")
    return
  }

  const customerEmail = invoice.customer_email

  let supporterId = null
  if (customerEmail) {
    const { data: supporter } = await supabaseAdmin
      .from("tenant_financial_supporters")
      .select("id, total_given")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .single()

    if (supporter) {
      supporterId = supporter.id
      await supabaseAdmin
        .from("tenant_financial_supporters")
        .update({
          total_given: (supporter.total_given || 0) + donationAmount,
          last_gift_at: new Date().toISOString(),
        })
        .eq("id", supporterId)
    }
  }

  await supabaseAdmin.from("tenant_donations").insert({
    tenant_id: tenantId,
    supporter_id: supporterId,
    amount: donationAmount,
    type: "recurring",
    status: "completed",
    stripe_payment_id: (invoice.payment_intent as string) || invoice.id,
    stripe_subscription_id: subscriptionId,
    donated_at: new Date().toISOString(),
  })

  const { data: tenant } = await supabaseAdmin.from("tenants").select("total_donations").eq("id", tenantId).single()

  if (tenant) {
    await supabaseAdmin
      .from("tenants")
      .update({
        total_donations: (tenant.total_donations || 0) + donationAmount,
        last_donation_at: new Date().toISOString(),
      })
      .eq("id", tenantId)
  }

  if (campaignId) {
    const { error: campaignDonationError } = await supabaseAdmin.from("campaign_donations").insert({
      campaign_id: campaignId,
      amount: donationAmount,
    })

    if (campaignDonationError) {
      console.error("[v0] Error inserting campaign donation:", campaignDonationError)
    }

    const { data: campaign } = await supabaseAdmin
      .from("tenant_campaigns")
      .select("current_amount")
      .eq("id", campaignId)
      .single()

    if (campaign) {
      await supabaseAdmin
        .from("tenant_campaigns")
        .update({
          current_amount: (campaign.current_amount || 0) + donationAmount,
        })
        .eq("id", campaignId)
    }
  }

  console.log("[v0] Invoice paid processing finished")
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = createAdminClient()

  console.log("[v0] Processing subscription.deleted:", subscription.id)

  const metadata = subscription.metadata || {}
  const tenantId = metadata.tenant_id

  if (!tenantId) return

  console.log("[v0] Subscription cancelled for tenant:", tenantId)
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabaseAdmin = createAdminClient()

  console.log("[v0] Payment intent succeeded:", paymentIntent.id)
}
