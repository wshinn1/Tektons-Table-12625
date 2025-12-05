-- Fix security warnings - drop functions first before recreating
-- This resolves parameter name conflicts

-- ==============================================
-- FIX VIEWS: Remove SECURITY DEFINER
-- ==============================================

-- Fix tenant_financial_stats view
DROP VIEW IF EXISTS tenant_financial_stats CASCADE;
CREATE VIEW tenant_financial_stats AS
SELECT 
  t.id,
  t.subdomain,
  t.full_name,
  COUNT(DISTINCT d.id) as total_donations,
  COALESCE(SUM(d.amount), 0) as total_raised,
  COALESCE(AVG(d.amount), 0) as average_donation,
  COUNT(DISTINCT d.supporter_id) as unique_supporters,
  MAX(d.created_at) as last_donation_date
FROM tenants t
LEFT JOIN donations d ON d.tenant_id = t.id
GROUP BY t.id, t.subdomain, t.full_name;

-- Fix post_share_counts view
DROP VIEW IF EXISTS post_share_counts CASCADE;
CREATE VIEW post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count,
  MAX(shared_at) as last_shared
FROM social_shares
GROUP BY post_id, platform;

-- ==============================================
-- FIX FUNCTIONS: Drop then recreate with search_path
-- ==============================================

-- Drop existing functions first to avoid parameter conflicts
DROP FUNCTION IF EXISTS generate_campaign_slug(text);
DROP FUNCTION IF EXISTS upsert_campaign_donation_digest();
DROP FUNCTION IF EXISTS add_tenant_to_contact_group();
DROP FUNCTION IF EXISTS initialize_tenant_navigation();

-- Recreate generate_campaign_slug function with search_path
CREATE FUNCTION generate_campaign_slug(campaign_title text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Generate base slug from title
  base_slug := lower(trim(regexp_replace(campaign_title, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  
  -- Start with base slug
  final_slug := base_slug;
  
  -- Check if slug exists, if so add counter
  WHILE EXISTS (SELECT 1 FROM campaigns WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Recreate upsert_campaign_donation_digest function with search_path
CREATE FUNCTION upsert_campaign_donation_digest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO campaign_donation_digest (
    campaign_id,
    total_donations,
    total_amount,
    unique_donors,
    last_donation_at,
    updated_at
  )
  VALUES (
    NEW.campaign_id,
    1,
    NEW.amount,
    1,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (campaign_id)
  DO UPDATE SET
    total_donations = campaign_donation_digest.total_donations + 1,
    total_amount = campaign_donation_digest.total_amount + NEW.amount,
    unique_donors = (
      SELECT COUNT(DISTINCT supporter_id)
      FROM donations
      WHERE campaign_id = NEW.campaign_id
    ),
    last_donation_at = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Recreate add_tenant_to_contact_group function with search_path
CREATE FUNCTION add_tenant_to_contact_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  default_group_id uuid;
BEGIN
  -- Get or create default contact group for this tenant
  SELECT id INTO default_group_id
  FROM contact_groups
  WHERE tenant_id = NEW.id AND name = 'All Contacts'
  LIMIT 1;
  
  IF default_group_id IS NULL THEN
    INSERT INTO contact_groups (tenant_id, name, description, is_default)
    VALUES (NEW.id, 'All Contacts', 'Default group for all contacts', true)
    RETURNING id INTO default_group_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate initialize_tenant_navigation function with search_path
CREATE FUNCTION initialize_tenant_navigation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Create default navigation items for new tenant
  INSERT INTO tenant_navigation (tenant_id, label, href, order_index, is_visible)
  VALUES
    (NEW.id, 'Home', '/', 1, true),
    (NEW.id, 'About', '/about', 2, true),
    (NEW.id, 'Blog', '/blog', 3, true),
    (NEW.id, 'Contact', '/contact', 4, true);
  
  RETURN NEW;
END;
$$;

-- Grant appropriate permissions on views
GRANT SELECT ON tenant_financial_stats TO authenticated;
GRANT SELECT ON post_share_counts TO authenticated;
