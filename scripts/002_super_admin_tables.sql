-- Super Admin Tables for Phase 2
-- Run this after 001_create_core_tables.sql

-- Create super_admins table
CREATE TABLE IF NOT EXISTS super_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users unique not null,
  email text not null,
  full_name text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can see super admins
CREATE POLICY super_admins_select ON super_admins
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb not null,
  updated_by uuid references super_admins(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can manage settings
CREATE POLICY platform_settings_all ON platform_settings
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Create platform_analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  total_tenants integer default 0,
  active_tenants integer default 0,
  total_donations numeric(10,2) default 0,
  platform_fees_collected numeric(10,2) default 0,
  tips_collected numeric(10,2) default 0,
  fee_coverage_collected numeric(10,2) default 0,
  created_at timestamp default now()
);

-- Enable RLS
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can view analytics
CREATE POLICY platform_analytics_select ON platform_analytics
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON super_admins(user_id);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value)
VALUES 
  ('base_platform_fee_percentage', '3.5'::jsonb),
  ('welcome_discount_percentage', '2.5'::jsonb),
  ('referral_program_enabled', 'true'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
