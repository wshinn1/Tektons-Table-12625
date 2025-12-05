-- Fix RLS performance for newsletters table

DROP POLICY IF EXISTS "Tenants can manage own newsletters" ON newsletters;
CREATE POLICY "Tenants can manage own newsletters" ON newsletters
  FOR ALL USING (tenant_id = (select auth.uid()));
