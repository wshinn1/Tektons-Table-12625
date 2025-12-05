-- Phase 1: Tenant Navigation Redesign - Database Schema Updates
-- This migration prepares the database for the new navigation system

-- 1. Add navbar_visible column to blog_posts table
-- This controls whether the navigation bar is shown when viewing this post
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS navbar_visible BOOLEAN DEFAULT true;

-- 2. Add menu_location column to tenant_menu_items table
-- This determines where the menu item appears:
-- 'navbar' = Top public navigation bar
-- 'sidebar_admin' = Admin sidebar (only visible to tenant owners)
-- 'sidebar_donor' = Donor sidebar (only visible to logged-in donors)
ALTER TABLE tenant_menu_items 
ADD COLUMN IF NOT EXISTS menu_location TEXT DEFAULT 'navbar' 
CHECK (menu_location IN ('navbar', 'sidebar_admin', 'sidebar_donor'));

-- 3. Update existing menu items to have menu_location = 'navbar'
-- (They are currently public navigation items)
UPDATE tenant_menu_items 
SET menu_location = 'navbar' 
WHERE menu_location IS NULL;

-- 4. Create index for menu_location for faster queries
CREATE INDEX IF NOT EXISTS idx_tenant_menu_items_location 
ON tenant_menu_items(tenant_id, menu_location);

-- 5. Add default admin sidebar items for wesshinn tenant
DO $$
DECLARE
  wesshinn_tenant_id UUID;
BEGIN
  SELECT id INTO wesshinn_tenant_id FROM tenants WHERE subdomain = 'wesshinn';
  
  IF wesshinn_tenant_id IS NOT NULL THEN
    -- Add admin sidebar items if they don't exist
    INSERT INTO tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system, menu_location)
    SELECT wesshinn_tenant_id, label, url, icon, sort_order, true, true, 'sidebar_admin'
    FROM (VALUES
      ('Manage Giving', '/admin/giving', 'DollarSign', 0),
      ('Blog Posts', '/admin/blog', 'FileText', 1),
      ('Custom Pages', '/admin/pages', 'Layout', 2),
      ('Navigation', '/admin/navigation', 'Menu', 3),
      ('Settings', '/admin/settings', 'Settings', 4)
    ) AS items(label, url, icon, sort_order)
    WHERE NOT EXISTS (
      SELECT 1 FROM tenant_menu_items 
      WHERE tenant_id = wesshinn_tenant_id 
      AND menu_location = 'sidebar_admin'
    );
    
    -- Add donor sidebar items if they don't exist
    INSERT INTO tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system, menu_location)
    SELECT wesshinn_tenant_id, label, url, icon, sort_order, true, true, 'sidebar_donor'
    FROM (VALUES
      ('My Dashboard', '/donor', 'LayoutDashboard', 0),
      ('Giving History', '/donor/giving', 'History', 1),
      ('Manage Recurring', '/donor/recurring', 'RefreshCw', 2)
    ) AS items(label, url, icon, sort_order)
    WHERE NOT EXISTS (
      SELECT 1 FROM tenant_menu_items 
      WHERE tenant_id = wesshinn_tenant_id 
      AND menu_location = 'sidebar_donor'
    );
  END IF;
END $$;

-- 6. Update the seed function to include menu_location for new tenants
CREATE OR REPLACE FUNCTION seed_tenant_default_menu_items(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  -- Only seed if no menu items exist for this tenant
  IF NOT EXISTS (SELECT 1 FROM tenant_menu_items WHERE tenant_id = p_tenant_id) THEN
    -- Public navbar items
    INSERT INTO tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system, menu_location) VALUES
      (p_tenant_id, 'Home', '/', 'Home', 0, true, true, 'navbar'),
      (p_tenant_id, 'About', '/about', 'User', 1, true, true, 'navbar'),
      (p_tenant_id, 'Blog', '/blog', 'FileText', 2, true, true, 'navbar'),
      (p_tenant_id, 'Give', '/giving', 'Heart', 3, true, true, 'navbar'),
      (p_tenant_id, 'Contact', '/contact', 'Mail', 4, true, true, 'navbar');
    
    -- Admin sidebar items
    INSERT INTO tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system, menu_location) VALUES
      (p_tenant_id, 'Manage Giving', '/admin/giving', 'DollarSign', 0, true, true, 'sidebar_admin'),
      (p_tenant_id, 'Blog Posts', '/admin/blog', 'FileText', 1, true, true, 'sidebar_admin'),
      (p_tenant_id, 'Custom Pages', '/admin/pages', 'Layout', 2, true, true, 'sidebar_admin'),
      (p_tenant_id, 'Navigation', '/admin/navigation', 'Menu', 3, true, true, 'sidebar_admin'),
      (p_tenant_id, 'Settings', '/admin/settings', 'Settings', 4, true, true, 'sidebar_admin');
    
    -- Donor sidebar items
    INSERT INTO tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system, menu_location) VALUES
      (p_tenant_id, 'My Dashboard', '/donor', 'LayoutDashboard', 0, true, true, 'sidebar_donor'),
      (p_tenant_id, 'Giving History', '/donor/giving', 'History', 1, true, true, 'sidebar_donor'),
      (p_tenant_id, 'Manage Recurring', '/donor/recurring', 'RefreshCw', 2, true, true, 'sidebar_donor');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
