-- Fix Row Level Security policies for pricing tables
-- Adds missing INSERT policies so onboarding can complete successfully

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "tenant_pricing_insert_own" ON tenant_pricing;
DROP POLICY IF EXISTS "pricing_history_insert_own" ON pricing_history;
DROP POLICY IF EXISTS "referral_codes_update_own" ON referral_codes;

-- Add INSERT policy for tenant_pricing
-- Allow tenants to insert their own pricing records during onboarding
CREATE POLICY "tenant_pricing_insert_own" ON tenant_pricing
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Add INSERT policy for pricing_history
-- Allow pricing history to be created during tenant setup
CREATE POLICY "pricing_history_insert_own" ON pricing_history
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Add UPDATE policy for referral_codes (for incrementing times_used)
-- Allow referral codes to be updated when used
CREATE POLICY "referral_codes_update_own" ON referral_codes
  FOR UPDATE USING (true) WITH CHECK (true);

-- Make the trigger function run with SECURITY DEFINER so it bypasses RLS
-- Allow the trigger to insert records even with RLS enabled
CREATE OR REPLACE FUNCTION create_tenant_referral_data()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate referral code
  new_code := generate_referral_code(NEW.full_name);
  
  INSERT INTO referral_codes (tenant_id, code)
  VALUES (NEW.id, new_code);
  
  -- Create pricing record with welcome discount (2.5% for 30 days)
  INSERT INTO tenant_pricing (
    tenant_id,
    current_rate_percentage,
    referral_count,
    rate_tier,
    discounted_until
  ) VALUES (
    NEW.id,
    2.50,
    0,
    'welcome',
    NOW() + INTERVAL '30 days'
  );
  
  -- Log pricing history
  INSERT INTO pricing_history (
    tenant_id,
    old_rate_percentage,
    new_rate_percentage,
    reason,
    effective_date,
    expires_at
  ) VALUES (
    NEW.id,
    3.50,
    2.50,
    'new_signup',
    NOW(),
    NOW() + INTERVAL '30 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
