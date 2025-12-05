-- Fix Supabase Security Linter Warnings
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: Fix Security Definer Views
-- Change from SECURITY DEFINER to SECURITY INVOKER
-- ============================================

-- 1. Fix tenant_financial_stats view
DROP VIEW IF EXISTS public.tenant_financial_stats;
CREATE VIEW public.tenant_financial_stats
WITH (security_invoker = true)
AS
SELECT 
  t.id as tenant_id,
  t.subdomain,
  t.full_name,
  COALESCE(SUM(d.amount), 0) as total_donations,
  COUNT(d.id) as donation_count,
  COALESCE(SUM(CASE WHEN d.created_at >= NOW() - INTERVAL '30 days' THEN d.amount ELSE 0 END), 0) as donations_last_30_days
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id AND d.status = 'succeeded'
GROUP BY t.id, t.subdomain, t.full_name;

-- 2. Fix backup_stats view (skip if backups table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backups') THEN
    DROP VIEW IF EXISTS public.backup_stats;
    EXECUTE '
      CREATE VIEW public.backup_stats
      WITH (security_invoker = true)
      AS
      SELECT 
        tenant_id,
        COUNT(*) as total_backups,
        MAX(created_at) as last_backup,
        SUM(CASE WHEN status = ''completed'' THEN 1 ELSE 0 END) as successful_backups
      FROM backups
      GROUP BY tenant_id
    ';
  ELSE
    RAISE NOTICE 'Skipping backup_stats view - backups table does not exist';
  END IF;
END $$;

-- 3. Skip common_questions view - chat_messages table doesn't exist
-- (Commented out because chat_messages table doesn't exist in production)

-- 4. Fix post_share_counts view (skip if social_shares table doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_shares') THEN
    DROP VIEW IF EXISTS public.post_share_counts;
    EXECUTE '
      CREATE VIEW public.post_share_counts
      WITH (security_invoker = true)
      AS
      SELECT 
        post_id,
        COUNT(*) as share_count,
        COUNT(DISTINCT platform) as platforms_used
      FROM social_shares
      GROUP BY post_id
    ';
  ELSE
    RAISE NOTICE 'Skipping post_share_counts view - social_shares table does not exist';
  END IF;
END $$;

-- ============================================
-- PART 2: Fix Function Search Path Mutable
-- Add SET search_path = public to functions
-- ============================================

-- 1. Fix generate_campaign_slug function
DROP FUNCTION IF EXISTS public.generate_campaign_slug(text, uuid);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
    EXECUTE '
      CREATE FUNCTION public.generate_campaign_slug(p_title TEXT, p_tenant_id UUID)
      RETURNS TEXT
      LANGUAGE plpgsql
      SET search_path = public
      AS $func$
      DECLARE
        base_slug TEXT;
        final_slug TEXT;
        counter INTEGER := 0;
      BEGIN
        base_slug := lower(regexp_replace(p_title, ''[^a-zA-Z0-9]+'', ''-'', ''g''));
        base_slug := trim(both ''-'' from base_slug);
        final_slug := base_slug;
        WHILE EXISTS (SELECT 1 FROM campaigns WHERE slug = final_slug AND campaigns.tenant_id = p_tenant_id) LOOP
          counter := counter + 1;
          final_slug := base_slug || ''-'' || counter;
        END LOOP;
        RETURN final_slug;
      END;
      $func$
    ';
  END IF;
END $$;

-- 2. Fix upsert_campaign_donation_digest function
-- Must drop trigger first, then function, then recreate both
DO $$
BEGIN
  -- Drop the trigger that depends on this function
  DROP TRIGGER IF EXISTS update_campaign_donation_digest ON donations;
  
  -- Now we can drop the function
  DROP FUNCTION IF EXISTS public.upsert_campaign_donation_digest();
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
    -- Recreate the function with secure search_path
    EXECUTE '
      CREATE FUNCTION public.upsert_campaign_donation_digest()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SET search_path = public
      AS $func$
      BEGIN
        IF NEW.campaign_id IS NOT NULL THEN
          UPDATE campaigns
          SET 
            current_amount = COALESCE(current_amount, 0) + NEW.amount,
            updated_at = NOW()
          WHERE id = NEW.campaign_id;
        END IF;
        RETURN NEW;
      END;
      $func$
    ';
    
    -- Recreate the trigger
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donations') THEN
      EXECUTE '
        CREATE TRIGGER update_campaign_donation_digest
        AFTER INSERT ON donations
        FOR EACH ROW
        EXECUTE FUNCTION upsert_campaign_donation_digest()
      ';
    END IF;
  END IF;
END $$;

-- 3. Fix update_pricing_sections_updated_at function
DROP FUNCTION IF EXISTS public.update_pricing_sections_updated_at() CASCADE;
CREATE FUNCTION public.update_pricing_sections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. Fix update_security_sections_updated_at function
DROP FUNCTION IF EXISTS public.update_security_sections_updated_at() CASCADE;
CREATE FUNCTION public.update_security_sections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 5. Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- Done! All security warnings should be fixed.
-- ============================================
