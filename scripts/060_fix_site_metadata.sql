-- Fix site metadata in system_settings table
-- This script ensures the site_metadata row exists and can be updated

-- First, check if the site_metadata row exists, if not create it
INSERT INTO system_settings (setting_key, setting_value, description, updated_at)
VALUES (
  'site_metadata',
  '{
    "title": "Tekton''s Table",
    "description": "A platform for missionaries and non-profits to receive donations and support.",
    "favicon_url": "/favicon.ico",
    "og_image": "",
    "twitter_card": "summary_large_image",
    "twitter_site": ""
  }'::jsonb,
  'Site metadata for SEO and social sharing',
  now()
)
ON CONFLICT (setting_key) DO NOTHING;

-- Add a policy to allow public read access to site_metadata (needed for SEO)
DROP POLICY IF EXISTS "Public can view site metadata" ON system_settings;
CREATE POLICY "Public can view site metadata" ON system_settings
  FOR SELECT
  USING (setting_key = 'site_metadata');

-- Update the modify policy to not require updated_by for site_metadata
DROP POLICY IF EXISTS "Super admins can modify system settings" ON system_settings;
CREATE POLICY "Super admins can modify system settings" ON system_settings
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
