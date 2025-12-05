-- Fix all Supabase security warnings
-- 1. Remove SECURITY DEFINER from all views
-- 2. Add search_path to all functions with mutable search_path

-- ===================================
-- PART 1: Fix SECURITY DEFINER Views
-- ===================================

-- Drop and recreate backup_stats view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.backup_stats CASCADE;
CREATE VIEW public.backup_stats AS
SELECT 
  backup_category,
  count(*) AS total_backups,
  count(*) FILTER (WHERE status = 'success') AS successful_backups,
  count(*) FILTER (WHERE status = 'failed') AS failed_backups,
  sum(file_size_bytes) AS total_size_bytes,
  max(created_at) AS last_backup_at
FROM backups
GROUP BY backup_category;

-- Drop and recreate tenant_financial_stats view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.tenant_financial_stats CASCADE;
CREATE VIEW public.tenant_financial_stats AS
SELECT 
  t.id AS tenant_id,
  t.subdomain,
  t.full_name,
  t.email,
  t.mission_organization,
  t.location,
  t.created_at,
  t.is_active,
  t.onboarding_completed,
  t.platform_fee_percentage,
  COALESCE(SUM(d.amount), 0) AS total_donations,
  COALESCE(SUM(d.platform_fee), 0) AS total_platform_fees,
  COALESCE(SUM(d.tip_amount), 0) AS total_tips,
  COUNT(d.id) AS donation_count,
  COUNT(DISTINCT d.supporter_id) AS unique_supporters,
  MAX(d.created_at) AS last_donation_at
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.subdomain, t.full_name, t.email, t.mission_organization, t.location, t.created_at, t.is_active, t.onboarding_completed, t.platform_fee_percentage;

-- Drop and recreate common_questions view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.common_questions CASCADE;
CREATE VIEW public.common_questions AS
SELECT 
  user_question AS example_question,
  lower(TRIM(BOTH FROM user_question)) AS question_normalized,
  count(*) AS frequency,
  avg(
    CASE
      WHEN helpful_rating > 0 THEN 1.0
      ELSE 0.0
    END) AS satisfaction_rate,
  max(created_at) AS last_asked,
  bool_or(converted_to_article) AS has_article
FROM chat_logs
WHERE user_question IS NOT NULL AND user_question <> ''
GROUP BY lower(TRIM(BOTH FROM user_question)), user_question
ORDER BY count(*) DESC;

-- Drop and recreate post_share_counts view WITHOUT SECURITY DEFINER
DROP VIEW IF EXISTS public.post_share_counts CASCADE;
CREATE VIEW public.post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count
FROM social_shares
GROUP BY post_id, platform;

-- ===================================
-- PART 2: Fix Function Search Paths
-- ===================================

-- Fix generate_campaign_slug function
CREATE OR REPLACE FUNCTION public.generate_campaign_slug(p_title TEXT, p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
  v_final_slug TEXT;
BEGIN
  -- Convert title to slug format
  v_slug := lower(trim(regexp_replace(p_title, '[^a-zA-Z0-9\s-]', '', 'g')));
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  
  -- Ensure slug is unique for this tenant
  v_final_slug := v_slug;
  WHILE EXISTS (
    SELECT 1 FROM public.tenant_campaigns 
    WHERE slug = v_final_slug AND tenant_id = p_tenant_id
  ) LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_slug || '-' || v_counter;
  END LOOP;
  
  RETURN v_final_slug;
END;
$$;

-- Fix upsert_campaign_donation_digest function
CREATE OR REPLACE FUNCTION public.upsert_campaign_donation_digest(
  p_campaign_id UUID,
  p_digest_period TEXT,
  p_digest_date DATE,
  p_total_amount NUMERIC,
  p_total_donors INTEGER,
  p_total_donations INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_digest_id UUID;
BEGIN
  INSERT INTO public.campaign_donation_digests (
    campaign_id,
    digest_period,
    digest_date,
    total_amount,
    total_donors,
    total_donations,
    created_at,
    updated_at
  ) VALUES (
    p_campaign_id,
    p_digest_period,
    p_digest_date,
    p_total_amount,
    p_total_donors,
    p_total_donations,
    NOW(),
    NOW()
  )
  ON CONFLICT (campaign_id, digest_period, digest_date)
  DO UPDATE SET
    total_amount = EXCLUDED.total_amount,
    total_donors = EXCLUDED.total_donors,
    total_donations = EXCLUDED.total_donations,
    updated_at = NOW()
  RETURNING id INTO v_digest_id;
  
  RETURN v_digest_id;
END;
$$;

-- Fix add_tenant_to_contact_group function
CREATE OR REPLACE FUNCTION public.add_tenant_to_contact_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_default_group_id UUID;
BEGIN
  -- Get or create the default "All Contacts" group for this tenant
  SELECT id INTO v_default_group_id
  FROM public.contact_groups
  WHERE tenant_id = NEW.id AND name = 'All Contacts'
  LIMIT 1;

  IF v_default_group_id IS NULL THEN
    INSERT INTO public.contact_groups (tenant_id, name, description, is_default)
    VALUES (NEW.id, 'All Contacts', 'Default group containing all contacts', true)
    RETURNING id INTO v_default_group_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Fix initialize_tenant_navigation function
CREATE OR REPLACE FUNCTION public.initialize_tenant_navigation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Insert default navigation items for new tenant
  INSERT INTO public.tenant_navigation (tenant_id, label, url, order_index, is_visible, is_default)
  VALUES 
    (NEW.id, 'Home', '/', 1, true, true),
    (NEW.id, 'About', '/about', 2, true, true),
    (NEW.id, 'Blog', '/blog', 3, true, true),
    (NEW.id, 'Contact', '/contact', 4, true, true)
  ON CONFLICT (tenant_id, label) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Add comments for documentation
COMMENT ON VIEW public.backup_stats IS 'Statistics view for backup operations (no SECURITY DEFINER)';
COMMENT ON VIEW public.tenant_financial_stats IS 'Financial statistics per tenant (no SECURITY DEFINER)';
COMMENT ON VIEW public.common_questions IS 'Aggregated common questions from chat logs (no SECURITY DEFINER)';
COMMENT ON VIEW public.post_share_counts IS 'Social share counts per post (no SECURITY DEFINER)';

COMMENT ON FUNCTION public.generate_campaign_slug IS 'Generates unique URL-friendly slug for campaigns (search_path secured)';
COMMENT ON FUNCTION public.upsert_campaign_donation_digest IS 'Upserts campaign donation digest records (search_path secured)';
COMMENT ON FUNCTION public.add_tenant_to_contact_group IS 'Trigger to add default contact group for new tenants (search_path secured)';
COMMENT ON FUNCTION public.initialize_tenant_navigation IS 'Trigger to initialize default navigation for new tenants (search_path secured)';
