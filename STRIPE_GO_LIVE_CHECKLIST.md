# Stripe Go-Live Checklist

This checklist will guide you through the process of switching your missionary fundraising platform from Stripe test mode to live mode.

---

## Pre-Launch Preparation

### 1. Verify Test Mode is Working

- [ ] Test donations are processing successfully
- [ ] Webhook events are being received and handled
- [ ] Donations appear in the database correctly
- [ ] Giving widget updates with new donations
- [ ] Donors receive confirmation emails
- [ ] Missionaries receive notification emails
- [ ] Financial reports show accurate data
- [ ] Platform admin dashboard shows donation stats
- [ ] Stripe Connect onboarding works for test missionaries

---

## Stripe Account Setup

### 2. Activate Your Platform Stripe Account for Live Mode

- [ ] Log in to [Stripe Dashboard](https://dashboard.stripe.com)
- [ ] Complete business verification (if not already done)
  - Business details
  - Business address
  - Tax ID (EIN for US businesses)
  - Bank account information
- [ ] Activate live mode (some accounts require manual activation)
- [ ] Configure payout schedule in Settings → Business settings
- [ ] Set up tax settings in Settings → Tax settings
- [ ] Review and accept Stripe's terms of service

**Note:** Business verification can take 1-2 business days. Start this early!

---

## Get Live API Keys

### 3. Retrieve Your Live Stripe Keys

- [ ] Go to [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)
- [ ] **Toggle to "Live mode"** in the top right corner
- [ ] Copy your **Publishable key** (starts with `pk_live_...`)
- [ ] Click "Reveal test key" and copy your **Secret key** (starts with `sk_live_...`)
- [ ] Keep these keys secure - DO NOT commit them to Git

### 4. Get Live Connect Client ID

- [ ] Go to [Stripe Dashboard → Connect → Settings](https://dashboard.stripe.com/settings/connect)
- [ ] **Toggle to "Live mode"**
- [ ] Copy your **Client ID** (starts with `ca_...`)
- [ ] Add your production redirect URI: `https://tektonstable.com/api/stripe/connect/callback`
- [ ] Save the Connect settings

---

## Update Environment Variables

### 5. Update Stripe Keys in Vercel

Go to your Vercel project settings → Environment Variables

- [ ] Update `STRIPE_SECRET_KEY` to your live secret key (`sk_live_...`)
- [ ] Update `STRIPE_PUBLISHABLE_KEY` to your live publishable key (`pk_live_...`)
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your live publishable key (`pk_live_...`)
- [ ] Update `STRIPE_CONNECT_CLIENT_ID` to your live Connect client ID (`ca_...`)

**Important:** 
- All three keys must be from live mode
- `STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` should be identical

---

## Configure Live Webhooks

### 6. Create Live Webhook Endpoint

- [ ] Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] **Toggle to "Live mode"**
- [ ] Click "Add endpoint"
- [ ] Enter endpoint URL: `https://tektonstable.com/api/stripe/webhook`
- [ ] Select the following events to listen to:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
  - [ ] `account.updated`
  - [ ] `account.application.deauthorized`
- [ ] Click "Add endpoint"

### 7. Update Webhook Secret

- [ ] Click on your newly created webhook endpoint
- [ ] Click "Reveal" under "Signing secret"
- [ ] Copy the webhook signing secret (starts with `whsec_...`)
- [ ] Go to Vercel → Environment Variables
- [ ] Update `STRIPE_WEBHOOK_SECRET` to your new live webhook secret

---

## Deploy Changes

### 8. Deploy to Production

- [ ] Push latest code to GitHub (if any changes were made)
- [ ] Deploy to Vercel production
- [ ] Wait for deployment to complete
- [ ] Verify deployment was successful

---

## Test Live Mode

### 9. Perform Live Transaction Test

**Use a REAL card with a small amount ($1-5)**

- [ ] Go to your production site
- [ ] Navigate to a missionary giving page
- [ ] Enter real card details (your own card or a test card)
  - Test card for live mode: `4242 4242 4242 4242`
  - Any future expiry date
  - Any 3-digit CVC
  - Any 5-digit ZIP
- [ ] Complete a $1 donation
- [ ] Verify you see the success page

### 10. Verify Donation Flow

- [ ] Check Stripe Dashboard → Payments (live mode) - donation appears
- [ ] Check your database - donation record exists in `donations` table
- [ ] Check webhook logs in Stripe Dashboard - events were received
- [ ] Check giving widget - updates with new donation amount (within 10 seconds)
- [ ] Check your email - received donation receipt
- [ ] Check missionary's email - received donation notification
- [ ] Check platform admin dashboard - donation appears in financial stats
- [ ] Check donor was added to `tenant_email_subscribers` table

### 11. Test Stripe Connect (Missionary Onboarding)

- [ ] Create a test missionary account OR use an existing one
- [ ] Go to their admin settings → Payments
- [ ] Click "Connect Stripe Account"
- [ ] Complete Stripe Connect onboarding with real information
  - This must be done in live mode with real details
  - Cannot use test mode accounts
- [ ] Verify connection shows as "Active" in admin dashboard

### 12. Test Donation to Connected Missionary

- [ ] Make a $5 donation to the missionary you just connected
- [ ] Verify donation appears in their financial dashboard
- [ ] Check Stripe Dashboard → Connect → Accounts
- [ ] Verify funds are routed to connected account (minus fees)
- [ ] Verify platform fee is captured correctly

### 13. Test Refund Flow

- [ ] Go to platform admin → Tenants → [select tenant] → Financial
- [ ] Find a test donation
- [ ] Issue a refund
- [ ] Verify refund appears in Stripe Dashboard
- [ ] Verify refund updates in database and financial reports

---

## Email Configuration

### 14. Verify Email Settings

- [ ] Confirm `RESEND_FROM_EMAIL` is set to `hello@tektonstable.com`
- [ ] Send a test donation - verify receipt email arrives
- [ ] Send a test contact form - verify confirmation email arrives
- [ ] Subscribe to a newsletter - verify confirmation email arrives
- [ ] Check spam folder if emails don't arrive

---

## Missionary Communication

### 15. Notify Existing Test Missionaries

**Important:** Test mode Stripe connections will NOT work in live mode

Create an announcement to send to all missionaries:

```
Subject: Action Required: Reconnect Your Stripe Account for Live Payments

Hi [Missionary Name],

We're excited to announce that Tekton's Table is now live and ready to accept real donations!

ACTION REQUIRED:
Your test Stripe account will no longer work. To receive donations, you need to reconnect your Stripe account:

1. Log in to your missionary dashboard
2. Go to Settings → Payments
3. Click "Connect Stripe Account"
4. Complete the onboarding with your real business/personal information
5. Verify your identity and bank account

This is a one-time setup that takes about 5-10 minutes.

Once connected, you'll be able to receive donations directly to your bank account.

Questions? Contact us at hello@tektonstable.com

Best regards,
The Tekton's Table Team
```

- [ ] Send announcement to all active missionaries
- [ ] Provide support email for questions
- [ ] Set up FAQ for common connection issues

---

## Monitoring & Alerts

### 16. Set Up Monitoring

- [ ] Add error tracking to catch webhook failures
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Set up alerts for:
  - Webhook endpoint failures
  - Payment processing errors
  - Connect account disconnections
  - Refund requests
- [ ] Check logs daily for first week
- [ ] Review Stripe Dashboard weekly

### 17. Create Monitoring Checklist

Daily (first week):
- [ ] Check Stripe Dashboard for any issues
- [ ] Review webhook event logs
- [ ] Check database for donation records
- [ ] Verify emails are being sent

Weekly (ongoing):
- [ ] Review total donations processed
- [ ] Check for any failed payments
- [ ] Review connected accounts status
- [ ] Monitor platform fee revenue

---

## Legal & Compliance

### 18. Update Terms and Policies

- [ ] Update Terms of Service with live payment information
- [ ] Update Privacy Policy with data handling details
- [ ] Add refund policy to giving pages
- [ ] Include tax deduction information (if applicable)
- [ ] Add disclaimers about donation processing times

### 19. Tax Considerations

- [ ] Consult with accountant about:
  - Platform fee revenue reporting
  - 1099 requirements for missionaries
  - Sales tax implications (if any)
  - Record keeping requirements
- [ ] Set up bookkeeping for platform revenue
- [ ] Plan for end-of-year tax reporting

---

## Backup & Security

### 20. Final Security Check

- [ ] Verify no API keys are committed to Git repository
- [ ] Check `.gitignore` includes `.env*` files
- [ ] Review RLS policies on all Supabase tables
- [ ] Verify webhook signature validation is working
- [ ] Test that users can't access other tenants' data
- [ ] Review admin authentication requirements

### 21. Backup Strategy

- [ ] Set up automated Supabase backups (if not already)
- [ ] Export current database schema
- [ ] Document disaster recovery plan
- [ ] Keep record of all environment variables (in secure location)

---

## Go-Live

### 22. Launch!

- [ ] All above steps completed
- [ ] Test transactions successful
- [ ] Webhooks receiving events
- [ ] Emails sending correctly
- [ ] Missionaries notified
- [ ] Monitoring in place

**You're live! 🎉**

### 23. Post-Launch Tasks

- [ ] Monitor closely for first 24 hours
- [ ] Respond quickly to any missionary questions
- [ ] Track first real donations
- [ ] Celebrate with your team!
- [ ] Gather feedback from early users

---

## Troubleshooting Common Issues

### Webhooks Not Firing

- Check webhook URL is correct: `https://tektonstable.com/api/stripe/webhook`
- Verify webhook secret is from live mode
- Check Stripe Dashboard → Webhooks → Event log for errors
- Verify endpoint is publicly accessible (not behind authentication)

### Donations Not Appearing

- Check database RLS policies allow inserts
- Verify webhook is receiving `checkout.session.completed` events
- Check server logs for errors
- Ensure admin client is being used to bypass RLS

### Emails Not Sending

- Verify Resend API key is valid
- Check `RESEND_FROM_EMAIL` is set correctly
- Test Resend connection in their dashboard
- Check spam folders

### Stripe Connect Issues

- Missionaries must complete identity verification
- Bank account must be added and verified
- Some countries have additional requirements
- Check Stripe Dashboard → Connect → Accounts for details

### Payment Failures

- Card declined - ask donor to contact their bank
- Insufficient funds - try different payment method
- 3D Secure required - ensure checkout supports SCA
- Review Stripe Dashboard for specific error codes

---

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## Rollback Plan

If critical issues arise:

1. Go to Vercel → Environment Variables
2. Switch back to test API keys
3. Update webhook secret back to test mode secret
4. Redeploy
5. Debug issues in test mode
6. When fixed, repeat go-live process

---

**Last Updated:** November 26, 2025

**Version:** 1.0
