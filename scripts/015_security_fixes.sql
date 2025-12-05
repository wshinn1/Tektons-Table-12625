-- Security Fixes
-- Fix all functions to have immutable search_path
-- Enable RLS on post_topics table
-- Remove SECURITY DEFINER from post_share_counts view

-- Fix 1: Enable RLS on post_topics table
ALTER TABLE post_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_topics
DROP POLICY IF EXISTS "post_topics_select_via_post" ON post_topics;
CREATE POLICY "post_topics_select_via_post" ON post_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_topics.post_id
        AND posts.tenant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "post_topics_insert_via_post" ON post_topics;
CREATE POLICY "post_topics_insert_via_post" ON post_topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_topics.post_id
        AND posts.tenant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "post_topics_delete_via_post" ON post_topics;
CREATE POLICY "post_topics_delete_via_post" ON post_topics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_topics.post_id
        AND posts.tenant_id = auth.uid()
    )
  );

-- Fix 2: Recreate post_share_counts view without SECURITY DEFINER
DROP VIEW IF EXISTS post_share_counts CASCADE;
CREATE VIEW post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count
FROM social_shares
GROUP BY post_id, platform;

-- Fix 3: Add SET search_path = '' to all functions for security

-- generate_referral_code
CREATE OR REPLACE FUNCTION generate_referral_code(tenant_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  random_suffix TEXT;
  final_code TEXT;
  code_exists BOOLEAN;
BEGIN
  base_code := LOWER(REGEXP_REPLACE(tenant_name, '[^a-zA-Z0-9]', '', 'g'));
  base_code := SUBSTRING(base_code FROM 1 FOR 8);
  
  LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    final_code := base_code || random_suffix;
    
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = final_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN final_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- is_super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- update_funding_goal_progress
CREATE OR REPLACE FUNCTION update_funding_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE funding_goals
  SET 
    current_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE tenant_id = NEW.tenant_id
        AND status = 'succeeded'
        AND created_at >= funding_goals.created_at
    ),
    updated_at = NOW()
  WHERE tenant_id = NEW.tenant_id
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- update_supporter_total_donated
CREATE OR REPLACE FUNCTION update_supporter_total_donated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE supporter_profiles
  SET 
    total_donated = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE supporter_id = NEW.supporter_id
        AND status = 'succeeded'
    ),
    donation_count = (
      SELECT COUNT(*)
      FROM donations
      WHERE supporter_id = NEW.supporter_id
        AND status = 'succeeded'
    ),
    last_donation_at = NOW()
  WHERE id = NEW.supporter_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- update_newsletter_timestamp
CREATE OR REPLACE FUNCTION update_newsletter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- create_tenant_referral_data
CREATE OR REPLACE FUNCTION create_tenant_referral_data()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := generate_referral_code(NEW.full_name);
  
  INSERT INTO referral_codes (tenant_id, code)
  VALUES (NEW.id, new_code);
  
  INSERT INTO tenant_pricing (
    tenant_id,
    base_fee_percentage,
    welcome_discount_percentage,
    welcome_discount_expires_at,
    current_tier
  ) VALUES (
    NEW.id,
    3.50,
    2.50,
    NOW() + INTERVAL '30 days',
    'welcome'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- update_campaign_amount
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET 
    current_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE campaign_id = NEW.campaign_id
        AND status = 'succeeded'
    ),
    updated_at = NOW()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- check_campaign_completion
CREATE OR REPLACE FUNCTION check_campaign_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.target_amount AND NEW.status = 'active' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Comment
COMMENT ON SCRIPT IS 'Security fixes for Supabase advisor warnings and errors';
