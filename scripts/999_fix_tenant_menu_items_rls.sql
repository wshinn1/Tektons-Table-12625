-- Fix RLS policies for tenant_menu_items table
-- The current policies are causing 403 errors when fetching nav items

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "tenant_menu_items_select_own" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_select_visible" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_public_read" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_owner_all" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_super_admin_all" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_insert_own" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_update_own" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_delete_own" ON tenant_menu_items;

-- Create new simplified policies

-- 1. Anyone can read visible menu items (for public navbar)
CREATE POLICY "tenant_menu_items_public_read" ON tenant_menu_items
  FOR SELECT
  USING (is_visible = true);

-- 2. Tenant owners can read ALL their menu items (including hidden ones)
CREATE POLICY "tenant_menu_items_owner_read" ON tenant_menu_items
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- 3. Tenant owners can insert their own menu items
CREATE POLICY "tenant_menu_items_owner_insert" ON tenant_menu_items
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- 4. Tenant owners can update their own menu items
CREATE POLICY "tenant_menu_items_owner_update" ON tenant_menu_items
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- 5. Tenant owners can delete their own non-system menu items
CREATE POLICY "tenant_menu_items_owner_delete" ON tenant_menu_items
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
    AND is_system = false
  );
