-- Fix RLS performance for tenants table
-- Wraps auth.uid() in (select auth.uid()) for better performance
-- Simplified to match actual production schema

-- Removed is_public references that don't exist in production
DROP POLICY IF EXISTS "Tenants can view own data" ON tenants;
CREATE POLICY "Tenants can view own data" ON tenants
  FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can update own data" ON tenants;
CREATE POLICY "Tenants can update own data" ON tenants
  FOR UPDATE USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can insert own data" ON tenants;
CREATE POLICY "Tenants can insert own data" ON tenants
  FOR INSERT WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can delete own data" ON tenants;
CREATE POLICY "Tenants can delete own data" ON tenants
  FOR DELETE USING (id = (select auth.uid()));

-- Keep public read access for tenant profiles (needed for subdomain sites)
DROP POLICY IF EXISTS "Public can view tenants" ON tenants;
CREATE POLICY "Public can view tenants" ON tenants
  FOR SELECT USING (true);
