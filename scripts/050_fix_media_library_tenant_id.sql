-- Fix media_library RLS policies to handle tenant_id stored as subdomain string
-- The issue: upload API stores tenant_id as subdomain (TEXT) but RLS tries to cast to UUID

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Super admins have full access to media_library" ON media_library;
DROP POLICY IF EXISTS "Platform media is visible to all authenticated users" ON media_library;
DROP POLICY IF EXISTS "Tenant users can view their tenant's media" ON media_library;
DROP POLICY IF EXISTS "Tenant users can insert their tenant's media" ON media_library;
DROP POLICY IF EXISTS "Tenant users can update their tenant's media" ON media_library;
DROP POLICY IF EXISTS "Tenant users can delete their tenant's media" ON media_library;

-- Recreate policies with correct tenant_id handling (subdomain as TEXT)

-- Super admins have full access
CREATE POLICY "Super admins have full access to media_library"
  ON media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Platform media (tenant_id = 'platform') is visible to all authenticated users
CREATE POLICY "Platform media is visible to all authenticated users"
  ON media_library
  FOR SELECT
  USING (
    tenant_id = 'platform' AND auth.uid() IS NOT NULL
  );

-- Tenant owners can view their tenant's media (match by subdomain)
CREATE POLICY "Tenant owners can view their tenant's media"
  ON media_library
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT subdomain FROM tenants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenant owners can insert their tenant's media (match by subdomain)
CREATE POLICY "Tenant owners can insert their tenant's media"
  ON media_library
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT subdomain FROM tenants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenant owners can update their tenant's media (match by subdomain)
CREATE POLICY "Tenant owners can update their tenant's media"
  ON media_library
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT subdomain FROM tenants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Tenant owners can delete their tenant's media (match by subdomain)
CREATE POLICY "Tenant owners can delete their tenant's media"
  ON media_library
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT subdomain FROM tenants WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
