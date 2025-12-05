-- Remove SECURITY DEFINER from all views with security warnings
-- This ensures views properly enforce Row Level Security policies

-- Drop and recreate backup_stats view
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

-- Drop and recreate post_share_counts view
DROP VIEW IF EXISTS post_share_counts;
CREATE VIEW post_share_counts AS
SELECT 
  post_id,
  platform,
  count(*) AS share_count
FROM social_shares
GROUP BY post_id, platform;

-- Drop and recreate tenant_financial_stats view
DROP VIEW IF EXISTS tenant_financial_stats;
CREATE VIEW tenant_financial_stats AS
SELECT 
  t.id AS tenant_id,
  t.full_name,
  t.subdomain,
  t.email,
  t.location,
  t.mission_organization,
  t.platform_fee_percentage,
  t.is_active,
  t.onboarding_completed,
  t.created_at,
  COALESCE(sum(d.amount), 0) AS total_donations,
  COALESCE(sum(d.platform_fee), 0) AS total_platform_fees,
  COALESCE(sum(d.tip_amount), 0) AS total_tips,
  count(DISTINCT d.id) AS donation_count,
  count(DISTINCT d.supporter_id) AS unique_supporters,
  max(d.created_at) AS last_donation_at
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.full_name, t.subdomain, t.email, t.location, t.mission_organization, 
         t.platform_fee_percentage, t.is_active, t.onboarding_completed, t.created_at;

-- Drop and recreate tenant_financials view
DROP VIEW IF EXISTS tenant_financials;
CREATE VIEW tenant_financials AS
SELECT 
  t.id AS tenant_id,
  t.full_name AS tenant_name,
  t.subdomain,
  t.email,
  COALESCE(sum(d.amount), 0) AS total_donations,
  COALESCE(sum(d.platform_fee), 0) AS total_platform_fees,
  COALESCE(sum(d.tip_amount), 0) AS total_tips,
  count(DISTINCT d.id) AS donation_count,
  count(DISTINCT d.supporter_id) AS supporter_count,
  max(d.created_at) AS last_donation_at
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.full_name, t.subdomain, t.email;

-- Drop and recreate admin_financials view
DROP VIEW IF EXISTS admin_financials;
CREATE VIEW admin_financials AS
SELECT 
  COALESCE(sum(amount), 0) AS total_donations,
  COALESCE(sum(platform_fee), 0) AS total_platform_fees,
  COALESCE(sum(tip_amount), 0) AS total_tips,
  COALESCE(sum(CASE WHEN supporter_covered_stripe_fee THEN stripe_fee ELSE 0 END), 0) AS fee_coverage_collected,
  count(DISTINCT tenant_id) AS active_tenants,
  (SELECT count(*) FROM tenants) AS total_tenants,
  count(*) AS successful_donations_count,
  COALESCE(avg(amount), 0) AS average_donation
FROM donations
WHERE status = 'succeeded';

-- Drop and recreate common_questions view
DROP VIEW IF EXISTS common_questions;
CREATE VIEW common_questions AS
SELECT 
  user_question AS example_question,
  lower(TRIM(BOTH FROM user_question)) AS question_normalized,
  count(*) AS frequency,
  avg(CASE WHEN helpful_rating > 0 THEN 1.0 ELSE 0.0 END) AS satisfaction_rate,
  max(created_at) AS last_asked,
  bool_or(converted_to_article) AS has_article
FROM chat_logs
WHERE user_question IS NOT NULL AND user_question <> ''
GROUP BY lower(TRIM(BOTH FROM user_question)), user_question
ORDER BY count(*) DESC
LIMIT 50;
