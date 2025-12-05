-- Fix RLS performance for media_library table

DROP POLICY IF EXISTS "Tenants can manage own media" ON media_library;
CREATE POLICY "Tenants can manage own media" ON media_library
  FOR ALL USING (tenant_id = (select auth.uid())::text);

DROP POLICY IF EXISTS "Public can view media" ON media_library;
CREATE POLICY "Public can view media" ON media_library
  FOR SELECT USING (true);
