-- Fix RLS performance for supporters table

DROP POLICY IF EXISTS "Tenants can manage own supporters" ON supporters;
CREATE POLICY "Tenants can manage own supporters" ON supporters
  FOR ALL USING (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can view own supporters" ON supporters;
CREATE POLICY "Tenants can view own supporters" ON supporters
  FOR SELECT USING (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can insert supporters" ON supporters;
CREATE POLICY "Tenants can insert supporters" ON supporters
  FOR INSERT WITH CHECK (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can update supporters" ON supporters;
CREATE POLICY "Tenants can update supporters" ON supporters
  FOR UPDATE USING (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can delete supporters" ON supporters;
CREATE POLICY "Tenants can delete supporters" ON supporters
  FOR DELETE USING (tenant_id = (select auth.uid()));
