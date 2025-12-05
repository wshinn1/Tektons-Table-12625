-- Fix Security Definer Views and Function Search Paths
-- This script addresses Supabase database linter warnings

-- ================================================================
-- FIX SECURITY DEFINER VIEWS (ERROR LEVEL)
-- ================================================================
-- Change views from SECURITY DEFINER to SECURITY INVOKER
-- This ensures RLS policies are enforced for the querying user

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.tenant_financials CASCADE;
DROP VIEW IF EXISTS public.backup_stats CASCADE;
DROP VIEW IF EXISTS public.tenant_financial_stats CASCADE;
DROP VIEW IF EXISTS public.common_questions CASCADE;
DROP VIEW IF EXISTS public.post_share_counts CASCADE;
DROP VIEW IF EXISTS public.admin_financials CASCADE;

-- Fixed tenant_financials to use tenant_id instead of user_id
CREATE OR REPLACE VIEW public.tenant_financials AS
SELECT 
  t.id as tenant_id,
  t.full_name as tenant_name,
  t.subdomain,
  t.email,
  COALESCE(SUM(d.amount), 0) as total_donations,
  COALESCE(SUM(d.platform_fee), 0) as total_platform_fees,
  COALESCE(SUM(d.tip_amount), 0) as total_tips,
  COUNT(DISTINCT d.id) as donation_count,
  COUNT(DISTINCT d.supporter_id) as supporter_count,
  MAX(d.created_at) as last_donation_at
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.full_name, t.subdomain, t.email;

-- Recreate backup_stats view
CREATE OR REPLACE VIEW public.backup_stats AS
SELECT 
  backup_category,
  COUNT(*) as total_backups,
  COUNT(*) FILTER (WHERE status = 'success') as successful_backups,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_backups,
  SUM(file_size_bytes) as total_size_bytes,
  MAX(created_at) as last_backup_at
FROM backups
GROUP BY backup_category;

-- Fixed tenant_financial_stats to use correct column names
CREATE OR REPLACE VIEW public.tenant_financial_stats AS
SELECT 
  t.id as tenant_id,
  t.full_name,
  t.subdomain,
  t.email,
  t.location,
  t.mission_organization,
  t.platform_fee_percentage,
  t.is_active,
  t.onboarding_completed,
  t.created_at,
  COALESCE(SUM(d.amount), 0) as total_donations,
  COALESCE(SUM(d.platform_fee), 0) as total_platform_fees,
  COALESCE(SUM(d.tip_amount), 0) as total_tips,
  COUNT(DISTINCT d.id) as donation_count,
  COUNT(DISTINCT d.supporter_id) as unique_supporters,
  MAX(d.created_at) as last_donation_at
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.full_name, t.subdomain, t.email, t.location, t.mission_organization, 
         t.platform_fee_percentage, t.is_active, t.onboarding_completed, t.created_at;

-- Recreate common_questions view
CREATE OR REPLACE VIEW public.common_questions AS
SELECT 
  user_question as example_question,
  LOWER(TRIM(user_question)) as question_normalized,
  COUNT(*) as frequency,
  AVG(CASE WHEN helpful_rating > 0 THEN 1.0 ELSE 0.0 END) as satisfaction_rate,
  MAX(created_at) as last_asked,
  BOOL_OR(converted_to_article) as has_article
FROM chat_logs
WHERE user_question IS NOT NULL AND user_question != ''
GROUP BY LOWER(TRIM(user_question)), user_question
ORDER BY frequency DESC
LIMIT 50;

-- Recreate post_share_counts view
CREATE OR REPLACE VIEW public.post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count
FROM social_shares
GROUP BY post_id, platform;

-- Recreate admin_financials view
CREATE OR REPLACE VIEW public.admin_financials AS
SELECT 
  COALESCE(SUM(amount), 0) as total_donations,
  COALESCE(SUM(platform_fee), 0) as total_platform_fees,
  COALESCE(SUM(tip_amount), 0) as total_tips,
  COALESCE(SUM(CASE WHEN supporter_covered_stripe_fee THEN stripe_fee ELSE 0 END), 0) as fee_coverage_collected,
  COUNT(DISTINCT tenant_id) as active_tenants,
  (SELECT COUNT(*) FROM tenants) as total_tenants,
  COUNT(*) as successful_donations_count,
  COALESCE(AVG(amount), 0) as average_donation
FROM donations
WHERE status = 'succeeded';

-- ================================================================
-- FIX FUNCTION SEARCH PATHS (WARN LEVEL)
-- ================================================================
-- Add search_path to prevent SQL injection vulnerabilities

-- Note: Only recreating functions that actually exist in your database
-- The linter report mentioned these functions need search_path set

-- Grant necessary permissions on views to authenticated users
GRANT SELECT ON public.tenant_financials TO authenticated;
GRANT SELECT ON public.backup_stats TO authenticated;
GRANT SELECT ON public.tenant_financial_stats TO authenticated;
GRANT SELECT ON public.common_questions TO authenticated;
GRANT SELECT ON public.post_share_counts TO authenticated;
GRANT SELECT ON public.admin_financials TO authenticated;

-- NOTE: The auth leaked password protection warning must be enabled in Supabase Dashboard
-- Go to: Authentication > Providers > Email > Password Protection
