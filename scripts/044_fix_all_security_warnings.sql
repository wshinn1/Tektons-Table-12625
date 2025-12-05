-- Fix all remaining security warnings from Supabase linter
-- Addresses WARN level function search_path issues and ERROR level SECURITY DEFINER views

-- ====================
-- FIX FUNCTION SEARCH_PATH WARNINGS
-- ====================

-- Only alter functions that actually exist in the database (verified via query)

ALTER FUNCTION public.check_campaign_completion()
SET search_path = public;

ALTER FUNCTION public.check_super_admin()
SET search_path = public;

ALTER FUNCTION public.create_draft_version()
SET search_path = public;

ALTER FUNCTION public.create_tenant_referral_data()
SET search_path = public;

ALTER FUNCTION public.extract_question_keywords(question text)
SET search_path = public;

-- Both overloaded versions of generate_referral_code
ALTER FUNCTION public.generate_referral_code(tenant_name text)
SET search_path = public;

ALTER FUNCTION public.generate_referral_code()
SET search_path = public;

ALTER FUNCTION public.get_financial_metrics(start_date timestamp without time zone, end_date timestamp without time zone)
SET search_path = public;

ALTER FUNCTION public.is_super_admin()
SET search_path = public;

ALTER FUNCTION public.update_campaign_amount()
SET search_path = public;

ALTER FUNCTION public.update_campaign_current_amount()
SET search_path = public;

ALTER FUNCTION public.update_draft_pages_updated_at()
SET search_path = public;

ALTER FUNCTION public.update_funding_goal_progress()
SET search_path = public;

ALTER FUNCTION public.update_newsletter_sent_count()
SET search_path = public;

ALTER FUNCTION public.update_newsletter_timestamp()
SET search_path = public;

ALTER FUNCTION public.update_post_topic_count()
SET search_path = public;

ALTER FUNCTION public.update_supporter_total_donated()
SET search_path = public;

ALTER FUNCTION public.update_topic_post_count()
SET search_path = public;

ALTER FUNCTION public.update_updated_at_column()
SET search_path = public;

-- ====================
-- FIX SECURITY DEFINER VIEWS
-- ====================

-- Drop and recreate backup_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.backup_stats;
CREATE VIEW public.backup_stats AS
SELECT 
  backup_category,
  count(*) AS total_backups,
  count(*) FILTER (WHERE status = 'success'::text) AS successful_backups,
  count(*) FILTER (WHERE status = 'failed'::text) AS failed_backups,
  sum(file_size_bytes) AS total_size_bytes,
  max(created_at) AS last_backup_at
FROM backups
GROUP BY backup_category;

-- Grant SELECT permissions on recreated view
GRANT SELECT ON public.backup_stats TO authenticated;

-- Note: The auth_leaked_password_protection warning must be enabled in Supabase Dashboard
-- under Authentication > Password Settings
