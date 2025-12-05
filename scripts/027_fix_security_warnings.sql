-- Fix Security Definer Warnings for Supabase Database Linter
-- This script addresses security warnings related to SECURITY DEFINER functions and views

-- ============================================================================
-- 1. Fix SECURITY DEFINER Functions by Adding search_path
-- ============================================================================

-- Update all functions to set search_path to prevent schema-jacking attacks

-- Fix create_tenant_referral_data function
CREATE OR REPLACE FUNCTION create_tenant_referral_data()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert default pricing record
  INSERT INTO tenant_pricing (
    tenant_id,
    current_rate_percentage,
    lifetime_rate_percentage,
    rate_tier,
    referral_count
  ) VALUES (
    NEW.id,
    5.0,
    5.0,
    'standard',
    0
  );

  -- Create pricing history record
  INSERT INTO pricing_history (
    tenant_id,
    old_rate_percentage,
    new_rate_percentage,
    reason,
    effective_date
  ) VALUES (
    NEW.id,
    NULL,
    5.0,
    'Initial account setup',
    NOW()
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_tenant_referral_data() IS 'Trigger function to initialize tenant pricing data. Uses SECURITY DEFINER to bypass RLS for initial setup.';

-- Fix check_super_admin function
CREATE OR REPLACE FUNCTION check_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM super_admins
    WHERE user_id = auth.uid()
  );
END;
$$;

COMMENT ON FUNCTION check_super_admin() IS 'Checks if the current user is a super admin. Uses SECURITY DEFINER to access super_admins table.';

-- Fix update_post_topic_count function
CREATE OR REPLACE FUNCTION update_post_topic_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics
    SET post_count = post_count + 1
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics
    SET post_count = GREATEST(0, post_count - 1)
    WHERE id = OLD.topic_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION update_post_topic_count() IS 'Trigger function to maintain post_count on topics table. Uses SECURITY DEFINER to update counts.';

-- Fix update_newsletter_sent_count function (if exists)
CREATE OR REPLACE FUNCTION update_newsletter_sent_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    UPDATE newsletters
    SET sent_count = sent_count + 1
    WHERE id = NEW.newsletter_id;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_newsletter_sent_count() IS 'Trigger function to track newsletter sent count. Uses SECURITY DEFINER to update counts.';

-- Fix update_campaign_current_amount function (if exists)
CREATE OR REPLACE FUNCTION update_campaign_current_amount()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE campaigns
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_campaign_current_amount() IS 'Trigger function to update campaign current_amount. Uses SECURITY DEFINER to update totals.';

-- Fix generate_referral_code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    -- If code doesn't exist, we can use it
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

COMMENT ON FUNCTION generate_referral_code() IS 'Generates unique referral codes. Uses SECURITY DEFINER to check existing codes.';

-- ============================================================================
-- 2. Drop and Recreate post_share_counts View Without SECURITY DEFINER
-- ============================================================================

-- Remove the SECURITY DEFINER view and recreate using social_shares table
DROP VIEW IF EXISTS post_share_counts;

CREATE VIEW post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count
FROM social_shares
GROUP BY post_id, platform;

COMMENT ON VIEW post_share_counts IS 'View without SECURITY DEFINER - relies on RLS policies of underlying social_shares table';

-- ============================================================================
-- Summary
-- ============================================================================

-- All functions now have SET search_path = public to prevent schema-jacking
-- All functions retain SECURITY DEFINER where needed for triggers to work
-- post_share_counts view recreated without SECURITY DEFINER using correct table name
