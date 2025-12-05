-- Tenant Page Builder & Menu Management Schema
-- This migration adds support for custom pages and menu management for tenants

-- Add page_builder_enabled flag to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS page_builder_enabled BOOLEAN DEFAULT false;

-- Enable page builder for wesshinn tenant only (for testing)
UPDATE tenants 
SET page_builder_enabled = true 
WHERE subdomain = 'wesshinn';

-- Create tenant_pages table for custom pages
CREATE TABLE IF NOT EXISTS tenant_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  design_json JSONB, -- Unlayer editor state
  html_content TEXT, -- Exported HTML
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique slugs per tenant
  UNIQUE(tenant_id, slug)
);

-- Create tenant_menu_items table for menu management
CREATE TABLE IF NOT EXISTS tenant_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT, -- Can be internal path or external URL
  page_id UUID REFERENCES tenant_pages(id) ON DELETE SET NULL, -- Links to custom pages
  icon TEXT, -- Icon name (optional)
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- True for built-in items (Home, About, Blog, etc.)
  open_in_new_tab BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_pages_tenant_id ON tenant_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_pages_slug ON tenant_pages(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_tenant_pages_status ON tenant_pages(status);
CREATE INDEX IF NOT EXISTS idx_tenant_menu_items_tenant_id ON tenant_menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_menu_items_sort_order ON tenant_menu_items(tenant_id, sort_order);

-- Enable RLS
ALTER TABLE tenant_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_menu_items ENABLE ROW LEVEL SECURITY;

-- Using email matching pattern instead of user_id (tenants table has no user_id column)

-- RLS Policies for tenant_pages
-- Tenants can only see their own pages
CREATE POLICY "tenant_pages_select_own" ON tenant_pages
  FOR SELECT USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Public can see published pages (for rendering)
CREATE POLICY "tenant_pages_select_published" ON tenant_pages
  FOR SELECT USING (status = 'published');

-- Tenants can insert their own pages
CREATE POLICY "tenant_pages_insert_own" ON tenant_pages
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenants can update their own pages
CREATE POLICY "tenant_pages_update_own" ON tenant_pages
  FOR UPDATE USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenants can delete their own pages
CREATE POLICY "tenant_pages_delete_own" ON tenant_pages
  FOR DELETE USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- RLS Policies for tenant_menu_items
-- Tenants can only see their own menu items
CREATE POLICY "tenant_menu_items_select_own" ON tenant_menu_items
  FOR SELECT USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Public can see visible menu items (for rendering sidebar)
CREATE POLICY "tenant_menu_items_select_visible" ON tenant_menu_items
  FOR SELECT USING (is_visible = true);

-- Tenants can insert their own menu items
CREATE POLICY "tenant_menu_items_insert_own" ON tenant_menu_items
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenants can update their own menu items
CREATE POLICY "tenant_menu_items_update_own" ON tenant_menu_items
  FOR UPDATE USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenants can delete their own menu items (only non-system ones)
CREATE POLICY "tenant_menu_items_delete_own" ON tenant_menu_items
  FOR DELETE USING (
    tenant_id IN (
      SELECT id FROM tenants 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    AND is_system = false
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenant_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tenant_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_tenant_pages_updated_at ON tenant_pages;
CREATE TRIGGER trigger_tenant_pages_updated_at
  BEFORE UPDATE ON tenant_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_pages_updated_at();

DROP TRIGGER IF EXISTS trigger_tenant_menu_items_updated_at ON tenant_menu_items;
CREATE TRIGGER trigger_tenant_menu_items_updated_at
  BEFORE UPDATE ON tenant_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_menu_items_updated_at();

-- Function to seed default menu items for a tenant
CREATE OR REPLACE FUNCTION seed_tenant_default_menu_items(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  -- Only seed if no menu items exist for this tenant
  IF NOT EXISTS (SELECT 1 FROM tenant_menu_items WHERE tenant_id = p_tenant_id) THEN
    INSERT INTO tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system) VALUES
      (p_tenant_id, 'Home', '/', 'Home', 0, true, true),
      (p_tenant_id, 'About', '/about', 'User', 1, true, true),
      (p_tenant_id, 'Support', '/giving', 'Heart', 2, true, true),
      (p_tenant_id, 'Subscribe', '/subscribe', 'FileText', 3, true, true),
      (p_tenant_id, 'Contact', '/contact', 'Link', 4, true, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed default menu items for wesshinn tenant
DO $$
DECLARE
  wesshinn_tenant_id UUID;
BEGIN
  SELECT id INTO wesshinn_tenant_id FROM tenants WHERE subdomain = 'wesshinn';
  IF wesshinn_tenant_id IS NOT NULL THEN
    PERFORM seed_tenant_default_menu_items(wesshinn_tenant_id);
  END IF;
END $$;
