-- Reset Test Financial Data for Live Launch
-- Run this script BEFORE switching Stripe to live mode
-- This will clear all test donations and financial data

-- ============================================
-- STEP 1: Clear all test donations
-- ============================================
DELETE FROM donations;

-- ============================================
-- STEP 2: Clear Stripe Connect account data from tenants
-- (Tenants will need to reconnect in live mode)
-- ============================================
UPDATE tenants SET
  stripe_account_id = NULL,
  stripe_onboarding_complete = false,
  stripe_charges_enabled = false,
  stripe_payouts_enabled = false
WHERE stripe_account_id IS NOT NULL;

-- ============================================
-- STEP 3: Clear any subscription/payment records
-- ============================================
DELETE FROM subscriptions WHERE 1=1;

-- ============================================
-- STEP 4: Clear payment intents if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_intents') THEN
    EXECUTE 'DELETE FROM payment_intents';
  END IF;
END $$;

-- ============================================
-- STEP 5: Clear invoice records if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invoices') THEN
    EXECUTE 'DELETE FROM invoices';
  END IF;
END $$;

-- ============================================
-- STEP 6: Reset campaign amounts raised
-- ============================================
UPDATE campaigns SET
  amount_raised = 0,
  donor_count = 0
WHERE amount_raised > 0 OR donor_count > 0;

-- ============================================
-- STEP 7: Clear webhook event logs if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stripe_webhook_events') THEN
    EXECUTE 'DELETE FROM stripe_webhook_events';
  END IF;
END $$;

-- ============================================
-- STEP 8: Clear any payout records if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payouts') THEN
    EXECUTE 'DELETE FROM payouts';
  END IF;
END $$;

-- ============================================
-- VERIFICATION: Show what was reset
-- ============================================
SELECT 'Financial data reset complete!' as status;
SELECT 'Donations remaining: ' || COUNT(*)::text as donations FROM donations;
SELECT 'Tenants with Stripe connected: ' || COUNT(*)::text as connected FROM tenants WHERE stripe_account_id IS NOT NULL;
SELECT 'Campaigns with funds: ' || COUNT(*)::text as campaigns FROM campaigns WHERE amount_raised > 0;
