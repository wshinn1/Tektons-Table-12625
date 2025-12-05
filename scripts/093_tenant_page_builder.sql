-- Tenant Page Builder & Menu Management System
-- This script adds support for tenants to create custom pages and manage their menu

-- =====================================================
-- STEP 1: Add feature flag to tenants table
-- =====================================================
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS page_builder_enabled BOOLEAN DEFAULT false;

-- Enable page builder for wesshinn tenant only (for testing)
UPDATE tenants 
SET page_builder_enabled = true 
WHERE subdomain = 'wesshinn';

-- =====================================================
-- STEP 2: Create tenant_pages table
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  design_json JSONB DEFAULT '{}',
  html_content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique slug per tenant
  UNIQUE(tenant_id, slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_pages_tenant_id ON tenant_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_pages_slug ON tenant_pages(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_tenant_pages_status ON tenant_pages(status);

-- =====================================================
-- STEP 3: Create tenant_menu_items table
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  page_id UUID REFERENCES tenant_pages(id) ON DELETE SET NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System items can be hidden but not deleted
  open_in_new_tab BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_menu_items_tenant_id ON tenant_menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_menu_items_sort_order ON tenant_menu_items(tenant_id, sort_order);

-- =====================================================
-- STEP 4: Enable Row Level Security
-- =====================================================
ALTER TABLE tenant_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_menu_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: RLS Policies for tenant_pages
-- =====================================================

-- Public can read published pages
CREATE POLICY "tenant_pages_public_read" ON tenant_pages
  FOR SELECT
  USING (status = 'published');

-- Tenant owners can do everything with their pages
CREATE POLICY "tenant_pages_owner_all" ON tenant_pages
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Super admins can do everything
CREATE POLICY "tenant_pages_super_admin_all" ON tenant_pages
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- =====================================================
-- STEP 6: RLS Policies for tenant_menu_items
-- =====================================================

-- Public can read visible menu items
CREATE POLICY "tenant_menu_items_public_read" ON tenant_menu_items
  FOR SELECT
  USING (is_visible = true);

-- Tenant owners can do everything with their menu items
CREATE POLICY "tenant_menu_items_owner_all" ON tenant_menu_items
  FOR ALL
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Super admins can do everything
CREATE POLICY "tenant_menu_items_super_admin_all" ON tenant_menu_items
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- =====================================================
-- STEP 7: Function to seed default menu items for a tenant
-- =====================================================
CREATE OR REPLACE FUNCTION seed_tenant_menu_items(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only seed if no menu items exist for this tenant
  IF NOT EXISTS (SELECT 1 FROM tenant_menu_items WHERE tenant_id = p_tenant_id) THEN
    INSERT INTO tenant_menu_items (tenant_id, label, url, sort_order, is_system, is_visible) VALUES
      (p_tenant_id, 'Home', '/', 0, true, true),
      (p_tenant_id, 'About', '/about', 1, true, true),
      (p_tenant_id, 'Support', '/giving', 2, true, true),
      (p_tenant_id, 'Subscribe', '/subscribe', 3, true, true),
      (p_tenant_id, 'Contact', '/contact', 4, true, true);
  END IF;
END;
$$;

-- =====================================================
-- STEP 8: Seed default menu items for wesshinn tenant
-- =====================================================
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE subdomain = 'wesshinn';
  IF v_tenant_id IS NOT NULL THEN
    PERFORM seed_tenant_menu_items(v_tenant_id);
  END IF;
END $$;

-- =====================================================
-- STEP 9: Updated_at trigger function (if not exists)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS tenant_pages_updated_at ON tenant_pages;
CREATE TRIGGER tenant_pages_updated_at
  BEFORE UPDATE ON tenant_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tenant_menu_items_updated_at ON tenant_menu_items;
CREATE TRIGGER tenant_menu_items_updated_at
  BEFORE UPDATE ON tenant_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 10: Reserved slugs check function
-- =====================================================
CREATE OR REPLACE FUNCTION check_reserved_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  reserved_slugs TEXT[] := ARRAY['about', 'blog', 'giving', 'admin', 'subscribe', 'contact', 'campaigns', 'api', 'auth'];
BEGIN
  IF NEW.slug = ANY(reserved_slugs) THEN
    RAISE EXCEPTION 'The slug "%" is reserved and cannot be used for custom pages', NEW.slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_tenant_page_slug ON tenant_pages;
CREATE TRIGGER check_tenant_page_slug
  BEFORE INSERT OR UPDATE ON tenant_pages
  FOR EACH ROW
  EXECUTE FUNCTION check_reserved_slug();
