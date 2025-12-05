-- Fix all security issues reported by Supabase
-- 1. Recreate views without SECURITY DEFINER
-- 2. Add search_path to functions

-- Drop and recreate admin_financials view without SECURITY DEFINER
DROP VIEW IF EXISTS admin_financials;
CREATE VIEW admin_financials AS
SELECT 
  COALESCE(sum(amount), 0::numeric) AS total_donations,
  COALESCE(sum(platform_fee), 0::numeric) AS total_platform_fees,
  COALESCE(sum(tip_amount), 0::numeric) AS total_tips,
  COALESCE(sum(
    CASE
      WHEN supporter_covered_stripe_fee THEN stripe_fee
      ELSE 0::numeric
    END), 0::numeric) AS fee_coverage_collected,
  count(DISTINCT tenant_id) AS active_tenants,
  (SELECT count(*) FROM tenants) AS total_tenants,
  count(*) AS successful_donations_count,
  COALESCE(avg(amount), 0::numeric) AS average_donation
FROM donations
WHERE status = 'succeeded';

-- Drop and recreate backup_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS backup_stats;
CREATE VIEW backup_stats AS
SELECT 
  backup_category,
  count(*) AS total_backups,
  count(*) FILTER (WHERE status = 'success') AS successful_backups,
  count(*) FILTER (WHERE status = 'failed') AS failed_backups,
  sum(file_size_bytes) AS total_size_bytes,
  max(created_at) AS last_backup_at
FROM backups
GROUP BY backup_category;

-- Drop and recreate common_questions view without SECURITY DEFINER
DROP VIEW IF EXISTS common_questions;
CREATE VIEW common_questions AS
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

-- Drop and recreate post_share_counts view without SECURITY DEFINER
DROP VIEW IF EXISTS post_share_counts;
CREATE VIEW post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count
FROM social_shares
GROUP BY post_id, platform;

-- Fixed tenant_financial_stats to use correct column names from tenants table
-- Drop and recreate tenant_financial_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS tenant_financial_stats;
CREATE VIEW tenant_financial_stats AS
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

-- Fixed tenant_financials to use correct column names
-- Drop and recreate tenant_financials view without SECURITY DEFINER
DROP VIEW IF EXISTS tenant_financials;
CREATE VIEW tenant_financials AS
SELECT 
  t.id AS tenant_id,
  t.full_name AS tenant_name,
  t.email,
  t.subdomain,
  COALESCE(sum(d.amount), 0::numeric) AS total_donations,
  COALESCE(sum(d.platform_fee), 0::numeric) AS total_platform_fees,
  COALESCE(sum(d.tip_amount), 0::numeric) AS total_tips,
  count(d.id) AS donation_count,
  count(DISTINCT d.supporter_id) AS supporter_count,
  max(d.created_at) AS last_donation_at
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.full_name, t.email, t.subdomain;

-- Update increment_blog_views function to add search_path
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$function$;

-- Grant execute to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.increment_blog_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_views(uuid) TO anon;

-- Update update_updated_at_column function to add search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
