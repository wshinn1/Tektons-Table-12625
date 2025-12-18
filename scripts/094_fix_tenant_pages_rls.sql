-- Fix tenant_pages RLS policies
-- Issue: Policies were checking "tenants.user_id" which doesn't exist
-- Solution: tenants.id IS the auth user id

-- Drop old policies
DROP POLICY IF EXISTS "tenant_pages_public_read" ON tenant_pages;
DROP POLICY IF EXISTS "tenant_pages_owner_all" ON tenant_pages;
DROP POLICY IF EXISTS "tenant_pages_super_admin_all" ON tenant_pages;
DROP POLICY IF EXISTS "tenant_menu_items_public_read" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_owner_all" ON tenant_menu_items;
DROP POLICY IF EXISTS "tenant_menu_items_super_admin_all" ON tenant_menu_items;

-- Fixed policies to use tenants.id = auth.uid() instead of non-existent user_id column

-- tenant_pages policies
CREATE POLICY "tenant_pages_select_published" ON tenant_pages
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "tenant_pages_select_own" ON tenant_pages
  FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "tenant_pages_insert_own" ON tenant_pages
  FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "tenant_pages_update_own" ON tenant_pages
  FOR UPDATE
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "tenant_pages_delete_own" ON tenant_pages
  FOR DELETE
  USING (tenant_id = auth.uid());

-- Super admin policy
CREATE POLICY "tenant_pages_super_admin_all" ON tenant_pages
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- tenant_menu_items policies
CREATE POLICY "tenant_menu_items_public_read" ON tenant_menu_items
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "tenant_menu_items_owner_read" ON tenant_menu_items
  FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "tenant_menu_items_owner_insert" ON tenant_menu_items
  FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "tenant_menu_items_owner_update" ON tenant_menu_items
  FOR UPDATE
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "tenant_menu_items_owner_delete" ON tenant_menu_items
  FOR DELETE
  USING (tenant_id = auth.uid() AND is_system = false);

-- Super admin policy for menu items
CREATE POLICY "tenant_menu_items_super_admin_all" ON tenant_menu_items
  FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );
