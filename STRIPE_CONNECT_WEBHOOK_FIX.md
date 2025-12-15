# Stripe Connect Webhook Configuration Fix

## The Problem

Your donations are processed through **Stripe Connect** (connected accounts for each tenant), but webhooks from connected accounts don't automatically reach your platform webhook endpoint.

## The Solution: Enable "Listen to events on connected accounts"

### Step 1: Edit Your Existing Webhook

1. Go to https://dashboard.stripe.com (Test mode)
2. Navigate to **Developers** → **Webhooks**
3. Click on your existing webhook: `TektonsTableStripeWebhook`
4. Click **Edit destination** button

### Step 2: Enable Connected Account Events

Look for the section **"Listen to events on connected accounts"** and check the box:

```
☑️ Listen to events on connected accounts
```

This tells Stripe to send events from connected accounts (your tenants' accounts) to YOUR platform webhook endpoint.

### Step 3: Verify Event Listening

Make sure these events are selected:
- ✅ `checkout.session.completed` 
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### Step 4: Keep the Endpoint URL

Your endpoint URL is correct:
```
https://wesshinn.tektonstable.com/api/stripe/webhook
```

**However**, I recommend changing it to:
```
https://tektonstable.com/api/stripe/webhook
```

This way the webhook works for ALL tenants, not just wesshinn.

### Step 5: Test

1. Save the webhook configuration
2. Make a test donation on any tenant site
3. Check Vercel logs for:
   ```
   [v0] Webhook event received: checkout.session.completed
   [v0] Event account: acct_xxxxx
   [v0] Donation recorded successfully
   ```

## Why This Matters

- **Without this setting**: Stripe Connect events stay on the connected account and never reach your platform
- **With this setting**: All events from tenant accounts flow to your platform webhook
- **Result**: Donations get recorded, emails get sent, reports get updated

## Current Status

Your webhook shows "0 Total" deliveries because it's not configured to listen to connected account events. Once you enable this, you'll start seeing events come through.
