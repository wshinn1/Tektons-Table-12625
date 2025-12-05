-- Fix blog_posts RLS to allow tenant owners to access their posts
-- The previous policy checked supporter_profiles but tenant owners are in tenants table

-- Drop the problematic policy
DROP POLICY IF EXISTS "Tenant users full access to their posts" ON blog_posts;

-- Create a new policy that checks if user is the tenant owner
CREATE POLICY "Tenant owners full access to their posts" ON blog_posts
  FOR ALL USING (
    tenant_id != 'platform' AND
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.subdomain = blog_posts.tenant_id 
      AND tenants.id = auth.uid()
    )
  );

-- Also add a policy for tenant owners to access draft posts
DROP POLICY IF EXISTS "Tenant owners can view draft posts" ON blog_posts;
CREATE POLICY "Tenant owners can view draft posts" ON blog_posts
  FOR SELECT USING (
    status = 'draft' AND
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE tenants.subdomain = blog_posts.tenant_id 
      AND tenants.id = auth.uid()
    )
  );
