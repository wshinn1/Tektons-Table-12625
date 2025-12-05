# Stripe Webhook Configuration Guide

## Critical Issue: Donations Not Being Recorded

Your donations are processing through Stripe successfully, but the webhook events are not reaching your server. This means donations aren't being recorded in the database and donors aren't receiving confirmation emails.

## Fix: Configure Stripe Webhook in Test Mode

### Step 1: Access Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Ensure you're in **Test mode** (toggle in top right corner)

### Step 2: Add Webhook Endpoint
1. Click **Developers** in the top menu
2. Click **Webhooks** in the left sidebar
3. Click **+ Add endpoint**
4. Enter endpoint URL: `https://wesshinn.tektonstable.com/api/stripe/webhook`

### Step 3: Select Events to Listen To
Add these events:
- `checkout.session.completed` (REQUIRED - triggers donation recording)
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Step 4: Get Webhook Signing Secret
1. Click on your newly created webhook
2. Click **Reveal** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)

### Step 5: Update Environment Variable
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find `STRIPE_WEBHOOK_SECRET`
4. Update it with the new signing secret you just copied
5. Click **Save**

### Step 6: Redeploy
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Check "Use existing Build Cache" for faster deployment

## Verify It's Working

After redeployment, make a test donation and check:

1. **Stripe Dashboard** → **Developers** → **Webhooks**:
   - You should see new events appear with "Succeeded" status

2. **Vercel Logs**:
   - Look for: `[v0] Webhook event received: checkout.session.completed`
   - Look for: `[v0] Donation recorded successfully`
   - Look for: `[v0] Donation receipt sent successfully`

3. **Tenant Financial Reports**:
   - The donation should appear in the financial reports
   - The giving widget should update with the new amount

4. **Donor Email**:
   - Donor should receive a receipt email
   - First-time donors should receive account invitation email

## Common Issues

**Issue: Webhook shows "Failed" status**
- Check that `STRIPE_WEBHOOK_SECRET` matches exactly (no extra spaces)
- Verify the endpoint URL is correct

**Issue: No events appearing at all**
- Verify you're in Test mode, not viewing production webhooks
- Ensure you're using test credit card (4242 4242 4242 4242)

**Issue: Events succeed but donations still don't appear**
- Check Vercel logs for error messages
- Verify Supabase is connected and database is accessible
</parameter>
