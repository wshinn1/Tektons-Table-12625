-- Fix RLS performance for campaigns table

DROP POLICY IF EXISTS "Tenants can manage own campaigns" ON campaigns;
CREATE POLICY "Tenants can manage own campaigns" ON campaigns
  FOR ALL USING (tenant_id = (select auth.uid()));

-- Removed is_active reference, allow public read for all campaigns
DROP POLICY IF EXISTS "Public can view active campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public can view campaigns" ON campaigns;
CREATE POLICY "Public can view campaigns" ON campaigns
  FOR SELECT USING (true);
