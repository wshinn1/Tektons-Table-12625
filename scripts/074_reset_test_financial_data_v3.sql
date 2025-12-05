-- Reset Test Financial Data for Live Stripe Migration (v3)
-- Run this BEFORE switching from test to live Stripe keys
-- This clears all test transactions while preserving account structures

-- STEP 1: Clear all test donations
DELETE FROM donations WHERE id IS NOT NULL;

-- STEP 2: Clear Stripe Connect account IDs from tenants (they need to reconnect in live mode)
UPDATE tenants 
SET stripe_account_id = NULL
WHERE stripe_account_id IS NOT NULL;

-- STEP 3: Reset campaign amounts (using correct column name: current_amount)
UPDATE campaigns 
SET current_amount = 0
WHERE current_amount > 0;

-- STEP 4: Clear any subscription/recurring donation records if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    EXECUTE 'DELETE FROM subscriptions WHERE id IS NOT NULL';
  END IF;
END $$;

-- STEP 5: Clear payout records if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payouts') THEN
    EXECUTE 'DELETE FROM payouts WHERE id IS NOT NULL';
  END IF;
END $$;

-- STEP 6: Clear webhook event logs if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'webhook_events') THEN
    EXECUTE 'DELETE FROM webhook_events WHERE id IS NOT NULL';
  END IF;
END $$;

-- STEP 7: Reset tenant giving settings if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_giving_settings') THEN
    EXECUTE 'UPDATE tenant_giving_settings SET fundraising_start_amount = 0 WHERE fundraising_start_amount > 0';
  END IF;
END $$;

-- STEP 8: Clear fundraising goals current amounts if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fundraising_goals') THEN
    EXECUTE 'UPDATE fundraising_goals SET current_amount = 0 WHERE current_amount > 0';
  END IF;
END $$;

-- Verification queries - check that everything is reset
SELECT 'Donations remaining: ' || COUNT(*)::text as status FROM donations;
SELECT 'Tenants with Stripe accounts: ' || COUNT(*)::text as status FROM tenants WHERE stripe_account_id IS NOT NULL;
SELECT 'Campaigns with funds: ' || COUNT(*)::text as status FROM campaigns WHERE current_amount > 0;
