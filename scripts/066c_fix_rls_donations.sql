-- Fix RLS performance for donations table

DROP POLICY IF EXISTS "Tenants can view own donations" ON donations;
CREATE POLICY "Tenants can view own donations" ON donations
  FOR SELECT USING (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Tenants can insert donations" ON donations;
CREATE POLICY "Tenants can insert donations" ON donations
  FOR INSERT WITH CHECK (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Public can insert donations" ON donations;
CREATE POLICY "Public can insert donations" ON donations
  FOR INSERT WITH CHECK (true);
