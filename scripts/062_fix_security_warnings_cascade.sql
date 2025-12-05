-- Fix security warnings - drop with CASCADE and recreate everything
-- This drops dependent triggers and recreates them

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
-- FIX FUNCTIONS: Drop with CASCADE and recreate
-- ==============================================

-- Drop existing functions with CASCADE (also drops dependent triggers)
DROP FUNCTION IF EXISTS generate_campaign_slug(text) CASCADE;
DROP FUNCTION IF EXISTS upsert_campaign_donation_digest() CASCADE;
DROP FUNCTION IF EXISTS add_tenant_to_contact_group() CASCADE;
DROP FUNCTION IF EXISTS initialize_tenant_navigation() CASCADE;

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

-- Recreate the trigger for donation digest
CREATE TRIGGER trg_upsert_campaign_donation_digest
AFTER INSERT ON donations
FOR EACH ROW
EXECUTE FUNCTION upsert_campaign_donation_digest();

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

-- Recreate the trigger for contact groups
CREATE TRIGGER trg_add_tenant_to_contacts
AFTER INSERT ON tenants
FOR EACH ROW
EXECUTE FUNCTION add_tenant_to_contact_group();

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

-- Recreate the trigger for tenant navigation
CREATE TRIGGER trg_initialize_tenant_navigation
AFTER INSERT ON tenants
FOR EACH ROW
EXECUTE FUNCTION initialize_tenant_navigation();

-- Grant appropriate permissions on views
GRANT SELECT ON tenant_financial_stats TO authenticated;
GRANT SELECT ON post_share_counts TO authenticated;
