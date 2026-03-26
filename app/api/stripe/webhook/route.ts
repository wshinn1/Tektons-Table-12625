import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { getResend, FROM_EMAIL } from "@/lib/resend"
import { EMAIL_TEMPLATES } from "@/lib/email-templates"
import { revalidatePath } from "next/cache"
import { generateDonationReceiptPdf } from "@/lib/pdf/donation-receipt"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  console.log("[v0] Webhook received")
  console.log("[v0] Has signature:", !!signature)
  console.log("[v0] Has webhook secret:", !!webhookSecret)
  console.log("[v0] Webhook secret length:", webhookSecret?.length || 0)

  if (!signature) {
    console.log("[v0] Missing stripe-signature header")
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  if (!webhookSecret) {
    console.log("[v0] Missing STRIPE_WEBHOOK_SECRET env var")
    return NextResponse.json({ error: "Missing webhook secret configuration" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("[v0] Webhook signature verified successfully")
    console.log("[v0] Event type:", event.type)
    console.log("[v0] Event account:", event.account)
  } catch (err: any) {
    console.log("[v0] Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Webhook signature verification failed", details: err.message }, { status: 400 })
  }

  const supabase = createAdminClient()
  const resend = getResend()

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const metadata = subscription.metadata

        console.log("[v0] Subscription event:", event.type)
        console.log("[v0] Subscription metadata:", metadata)

        // Check if this is a premium resources subscription
        if (metadata?.subscription_type === "premium_resources") {
          const userId = metadata.user_id

          if (!userId) {
            console.log("[v0] No user_id in subscription metadata")
            return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
          }

          console.log("[v0] Processing premium subscription for user:", userId)

          const subscriptionData = {
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }

          // Upsert the subscription record
          const { error: upsertError } = await supabase.from("premium_subscriptions").upsert(subscriptionData, {
            onConflict: "user_id",
          })

          if (upsertError) {
            console.error("[v0] Error upserting premium subscription:", upsertError)
            throw upsertError
          }

          console.log("[v0] Premium subscription saved successfully")

          // Revalidate pages
          revalidatePath("/resources", "page")
          revalidatePath("/blog", "page")
          revalidatePath("/account/subscription", "page")
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const metadata = subscription.metadata

        if (metadata?.subscription_type === "premium_resources") {
          const userId = metadata.user_id

          if (userId) {
            console.log("[v0] Canceling premium subscription for user:", userId)

            const { error } = await supabase
              .from("premium_subscriptions")
              .update({
                status: "canceled",
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId)

            if (error) {
              console.error("[v0] Error canceling premium subscription:", error)
            }

            revalidatePath("/resources", "page")
            revalidatePath("/blog", "page")
            revalidatePath("/account/subscription", "page")
          }
        }

        break
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const metadata = session.metadata

        if (metadata?.subscription_type === "premium_resources") {
          console.log("[v0] Premium subscription checkout completed")
          console.log("[v0] User ID:", metadata.user_id)
          console.log("[v0] Subscription ID:", session.subscription)

          // The subscription.created event will handle the database update
          // But we can also handle it here for immediate effect
          if (session.subscription && metadata.user_id) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

            const subscriptionData = {
              user_id: metadata.user_id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              canceled_at: null,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            }

            const { error: upsertError } = await supabase.from("premium_subscriptions").upsert(subscriptionData, {
              onConflict: "user_id",
            })

            if (upsertError) {
              console.error("[v0] Error saving premium subscription from checkout:", upsertError)
            } else {
              console.log("[v0] Premium subscription saved from checkout session")
            }

            revalidatePath("/resources", "page")
            revalidatePath("/blog", "page")
            revalidatePath("/account/subscription", "page")
          }

          return NextResponse.json({ received: true })
        }

        const tenantId = metadata?.tenant_id
        const campaignId = metadata?.campaign_id
        const donorEmail = session.customer_email || session.customer_details?.email
        const donorName = session.customer_details?.name || "Anonymous"
        const authenticatedUserId = metadata?.authenticated_user_id

        if (!tenantId) {
          // Not a tenant donation and not a premium subscription - skip
          console.log("[v0] Checkout completed but no tenant_id or subscription_type - skipping")
          return NextResponse.json({ received: true })
        }

        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("id, subdomain, full_name, email, is_registered_nonprofit, nonprofit_ein, nonprofit_status")
          .eq("id", tenantId)
          .single()

        if (!tenant) {
          return NextResponse.json({ error: "Tenant not found" }, { status: 400 })
        }

        let supporterId = null
        if (authenticatedUserId) {
          const { data: existingSupporter } = await supabase
            .from("supporter_profiles")
            .select("id")
            .eq("id", authenticatedUserId)
            .eq("tenant_id", tenantId)
            .single()

          if (existingSupporter) {
            supporterId = existingSupporter.id
          }
        }

        if (!supporterId && donorEmail) {
          try {
            const { data: supporter, error: supporterError } = await supabase
              .from("supporters")
              .upsert(
                {
                  tenant_id: tenantId,
                  email: donorEmail,
                  full_name: donorName,
                },
                {
                  onConflict: "tenant_id,email",
                  ignoreDuplicates: false,
                },
              )
              .select("id")
              .single()

            if (supporterError) {
              const { data: existing } = await supabase
                .from("supporters")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("email", donorEmail)
                .single()

              supporterId = existing?.id
            } else {
              supporterId = supporter?.id
            }

            if (supporterId) {
              const { data: group } = await supabase
                .from("contact_groups")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("name", "Financial Supporters")
                .single()

              let groupId = group?.id

              if (!groupId) {
                const { data: newGroup } = await supabase
                  .from("contact_groups")
                  .insert({
                    tenant_id: tenantId,
                    name: "Financial Supporters",
                    description: "Donors who have made financial contributions",
                  })
                  .select("id")
                  .single()

                groupId = newGroup?.id
              }

              if (groupId) {
                const { error: memberError } = await supabase.from("contact_group_members").insert({
                  group_id: groupId,
                  contact_id: supporterId,
                })

                if (memberError && memberError.code !== "23505") {
                  console.error("Error adding to contact group:", memberError)
                }
              }
            }
          } catch (err) {
            console.error("Exception handling supporter:", err)
          }
        }

        const donationAmount = Number.parseFloat(metadata?.donation_amount || "0")
        const tipAmount = Number.parseFloat(metadata?.tip_amount || "0")
        const totalAmount = session.amount_total ? session.amount_total / 100 : 0
        const supporterCoveredFees = metadata?.supporter_covered_stripe_fee === "true"

        let platformFee = 0
        if (metadata?.fee_model === "platform_fee") {
          const paymentIntentId = session.payment_intent as string
          if (paymentIntentId && event.account) {
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
                stripeAccount: event.account,
              })
              platformFee = (paymentIntent.application_fee_amount || 0) / 100
            } catch (feeError) {
              console.error("Error retrieving payment intent for fees:", feeError)
            }
          }
        } else if (metadata?.fee_model === "donor_tips") {
          platformFee = tipAmount
        }

        const stripeFee = totalAmount * 0.029 + 0.3

        const { data: insertedDonation, error: insertError } = await supabase
          .from("donations")
          .insert({
            tenant_id: tenantId,
            supporter_id: supporterId,
            stripe_payment_intent_id: (session.payment_intent as string) || null,
            amount: donationAmount,
            platform_fee: platformFee,
            stripe_fee: stripeFee,
            tip_amount: tipAmount,
            supporter_covered_stripe_fee: supporterCoveredFees,
            is_recurring: session.mode === "subscription",
            status: "completed",
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error inserting donation:", insertError)
          throw insertError
        }

        if (campaignId && insertedDonation?.id) {
          try {
            const { error: campaignDonationError } = await supabase.from("campaign_donations").insert({
              campaign_id: campaignId,
              donation_id: insertedDonation.id,
              amount: donationAmount,
            })

            if (campaignDonationError) {
              console.error("Error creating campaign donation record:", campaignDonationError)
            }

            const { error: incrementError } = await supabase.rpc("increment_campaign_amount", {
              p_campaign_id: campaignId,
              p_amount: donationAmount,
            })

            if (incrementError) {
              console.error("Error incrementing campaign amount:", incrementError)
            }

            const { data: campaign } = await supabase
              .from("tenant_campaigns")
              .select("title, slug, tenant_id")
              .eq("id", campaignId)
              .single()

            if (campaign) {
              const { data: tenantData } = await supabase
                .from("tenants")
                .select("full_name, email, subdomain, campaign_notification_preference")
                .eq("id", campaign.tenant_id)
                .single()

              if (tenantData) {
                const notificationPreference = tenantData.campaign_notification_preference || "immediate"

                if (notificationPreference === "immediate") {
                  const campaignUrl = `https://${tenantData.subdomain}.${process.env.NEXT_PUBLIC_SITE_URL || "tektonstable.com"}/campaigns/${campaign.slug}`

                  const notificationEmail = EMAIL_TEMPLATES.campaignDonationNotification({
                    tenantName: tenantData.full_name,
                    campaignTitle: campaign.title,
                    donorName: donorName || "Someone",
                    amount: donationAmount,
                    isRecurring: session.mode === "subscription",
                    frequency: session.mode === "subscription" ? metadata?.frequency : undefined,
                    campaignUrl,
                    isAnonymous: !donorName || donorName === "Anonymous",
                  })

                  try {
                    await resend.emails.send({
                      from: `Kingdom Building <${FROM_EMAIL}>`,
                      to: tenantData.email,
                      subject: notificationEmail.subject,
                      html: notificationEmail.html,
                      replyTo: FROM_EMAIL,
                    })
                  } catch (emailError) {
                    console.error("Error sending campaign notification:", emailError)
                  }
                } else if (notificationPreference === "daily") {
                  const { error: digestError } = await supabase.rpc("upsert_campaign_donation_digest", {
                    p_tenant_id: campaign.tenant_id,
                    p_amount: donationAmount,
                  })

                  if (digestError) {
                    console.error("Error updating campaign donation digest:", digestError)
                  }
                }
              }
            }

            if (donorEmail) {
              const campaignUrl = `https://${tenant.tenant_id}.${process.env.NEXT_PUBLIC_SITE_URL || "tektonstable.com"}/campaigns/${campaign.slug}`

              const receiptEmail = EMAIL_TEMPLATES.campaignDonationReceipt({
                donorName: donorName || "Valued Supporter",
                campaignTitle: campaign.title,
                tenantName: tenant.full_name,
                amount: donationAmount,
                isRecurring: session.mode === "subscription",
                frequency: session.mode === "subscription" ? metadata?.frequency : undefined,
                date: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                campaignUrl,
              })

              try {
                const pdfBuffer = await generateDonationReceiptPdf({
                  donorName: donorName || "Valued Supporter",
                  donorEmail,
                  amount: Math.round(donationAmount * 100),
                  currency: "$",
                  tenantName: tenant.full_name,
                  tenantSlug: tenant.subdomain,
                  donationDate: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  transactionId: (session.payment_intent as string) || session.id,
                  isRecurring: session.mode === "subscription",
                })

                await resend.emails.send({
                  from: `Kingdom Building <${FROM_EMAIL}>`,
                  to: donorEmail,
                  subject: receiptEmail.subject,
                  html: receiptEmail.html,
                  replyTo: tenant.email,
                  attachments: [
                    {
                      filename: `donation-receipt-${new Date().toISOString().split("T")[0]}.pdf`,
                      content: pdfBuffer,
                    },
                  ],
                })
              } catch (emailError: any) {
                console.error("Error sending campaign receipt:", emailError)
              }
            }
          } catch (campaignError) {
            console.error("Exception linking donation to campaign:", campaignError)
          }
        }

        if (donorEmail && donorName) {
          try {
            const { error: subscriberError } = await supabase.from("tenant_email_subscribers").upsert(
              {
                tenant_id: tenantId,
                email: donorEmail,
                name: donorName,
                status: "subscribed",
                subscribed_at: new Date().toISOString(),
              },
              {
                onConflict: "tenant_id,email",
                ignoreDuplicates: false,
              },
            )

            if (subscriberError) {
              console.error("Error adding donor to email subscribers:", subscriberError)
            }
          } catch (subscribeError) {
            console.error("Exception adding donor to subscribers:", subscribeError)
          }
        }

        if (donorEmail && !campaignId) {
          try {
            const receiptEmail = EMAIL_TEMPLATES.donationReceipt({
              donorName: donorName || "Valued Supporter",
              donorEmail,
              amount: Math.round(donationAmount * 100),
              currency: "$",
              tenantName: tenant.full_name,
              tenantSlug: tenant.subdomain,
              donationDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              transactionId: (session.payment_intent as string) || session.id,
              isRecurring: session.mode === "subscription",
            })

            const pdfBuffer = await generateDonationReceiptPdf({
              donorName: donorName || "Valued Supporter",
              donorEmail,
              amount: Math.round(donationAmount * 100),
              currency: "$",
              tenantName: tenant.full_name,
              tenantSlug: tenant.subdomain,
              donationDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              transactionId: (session.payment_intent as string) || session.id,
              isRecurring: session.mode === "subscription",
            })

            await resend.emails.send({
              from: `Kingdom Building <${FROM_EMAIL}>`,
              to: donorEmail,
              subject: receiptEmail.subject,
              html: receiptEmail.html,
              replyTo: tenant.email,
              attachments: [
                {
                  filename: `donation-receipt-${new Date().toISOString().split("T")[0]}.pdf`,
                  content: pdfBuffer,
                },
              ],
            })
          } catch (emailError) {
            console.error("Error sending donation receipt:", emailError)
          }
        }

        try {
          const { data: tenantData } = await supabase.from("tenants").select("subdomain").eq("id", tenantId).single()

          if (tenantData?.subdomain) {
            revalidatePath("/", "layout") // Revalidate root layout
            revalidatePath("/", "page")
            revalidatePath("/giving", "page")
            revalidatePath("/admin/financial", "page")

            if (campaignId) {
              revalidatePath("/campaigns/[slug]", "page")
              revalidatePath("/admin/campaigns", "page")
            }

            revalidatePath("/[tenant]", "layout")
          }
        } catch (revalError) {
          console.error("Error revalidating cache:", revalError)
        }

        if (donorEmail && supporterId && !authenticatedUserId) {
          try {
            const { data: donations, error: countError } = await supabase
              .from("donations")
              .select("id")
              .eq("supporter_id", supporterId)
              .eq("status", "completed")

            if (countError) {
              console.error("Error counting donations:", countError)
            }

            const isFirstDonation = (donations?.length || 0) === 1

            if (isFirstDonation) {
              const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
              const signupLink = `${baseUrl}/auth/supporter-signup?tenant=${tenantId}&email=${encodeURIComponent(donorEmail)}&name=${encodeURIComponent(donorName)}`

              const invitationEmail = EMAIL_TEMPLATES.donorAccountInvitation({
                donorName,
                tenantName: tenant.full_name || metadata?.tenant_name || "Missionary",
                amount: donationAmount,
                signupLink,
              })

              try {
                await resend.emails.send({
                  from: `Kingdom Building <${FROM_EMAIL}>`,
                  to: donorEmail,
                  subject: invitationEmail.subject,
                  html: invitationEmail.html,
                })
              } catch (emailError: any) {
                console.error("Error sending donation receipt:", emailError)
              }
            }
          } catch (inviteCheckError) {
            console.error("Error in invitation flow:", inviteCheckError)
          }
        }
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const metadata = paymentIntent.metadata
        const tenantId = metadata.tenant_id

        console.log("payment_intent.succeeded already processed via checkout.session.completed - skipping")
        return NextResponse.json({ received: true })
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("Payment failed:", paymentIntent.id)

        const metadata = paymentIntent.metadata
        const tenantId = metadata.tenant_id

        if (tenantId) {
          console.log("Payment failed for tenant:", tenantId)
          console.log("Amount:", paymentIntent.amount / 100)
        }

        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        console.log("Connected account updated:", account.id)

        await supabase
          .from("tenants")
          .update({
            stripe_account_status: account.charges_enabled ? "active" : "pending",
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
          })
          .eq("stripe_account_id", account.id)

        break
      }

      default:
        console.log("Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error in webhook handler:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
