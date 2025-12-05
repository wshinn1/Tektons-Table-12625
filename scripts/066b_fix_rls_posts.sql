-- Fix RLS performance for posts table

DROP POLICY IF EXISTS "Tenants can manage own posts" ON posts;
CREATE POLICY "Tenants can manage own posts" ON posts
  FOR ALL USING (tenant_id = (select auth.uid()));

DROP POLICY IF EXISTS "Public can view published posts" ON posts;
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT USING (is_published = true);
