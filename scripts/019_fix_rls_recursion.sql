-- Fix infinite recursion in RLS policies
-- The issue: super_admins policy checks super_admins table, creating circular dependency

-- Drop ALL existing policies on super_admins to start fresh
DROP POLICY IF EXISTS super_admins_select ON super_admins;
DROP POLICY IF EXISTS "Super admins can view themselves" ON super_admins;
DROP POLICY IF EXISTS "Public can check super admin status" ON super_admins;

-- Fix super_admins policy to avoid recursion by using auth.uid() directly
CREATE POLICY "Super admins can view themselves"
  ON super_admins FOR SELECT
  USING (user_id = auth.uid());

-- Allow public read access to super_admins for policy checks (needed for other tables)
-- This is safe because we only store user_id references, no sensitive data
CREATE POLICY "Public can check super admin status"
  ON super_admins FOR SELECT
  USING (true);

-- Make site_content publicly readable for landing page
DROP POLICY IF EXISTS "Super admins can manage site content" ON site_content;
DROP POLICY IF EXISTS "Public can view site content" ON site_content;
DROP POLICY IF EXISTS "Super admins can insert site content" ON site_content;
DROP POLICY IF EXISTS "Super admins can update site content" ON site_content;
DROP POLICY IF EXISTS "Super admins can delete site content" ON site_content;

-- Public can view active site content (needed for landing page)
CREATE POLICY "Public can view site content"
  ON site_content FOR SELECT
  USING (true);

-- Only super admins can insert/update/delete site content
CREATE POLICY "Super admins can insert site content"
  ON site_content FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

CREATE POLICY "Super admins can update site content"
  ON site_content FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

CREATE POLICY "Super admins can delete site content"
  ON site_content FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Update other policies that might have same issue
-- Added DROP statement for platform_settings policy
DROP POLICY IF EXISTS platform_settings_all ON platform_settings;
DROP POLICY IF EXISTS "Super admins can manage settings" ON platform_settings;

CREATE POLICY "Super admins can manage settings"
  ON platform_settings FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Added DROP statement for platform_analytics policy
DROP POLICY IF EXISTS platform_analytics_select ON platform_analytics;
DROP POLICY IF EXISTS "Super admins can view analytics" ON platform_analytics;

CREATE POLICY "Super admins can view analytics"
  ON platform_analytics FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );
