-- Phase 12: Advanced Super Admin Controls

-- System-wide settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES super_admins(id),
  updated_at timestamp DEFAULT now()
);

-- Platform fee configuration with history
CREATE TABLE IF NOT EXISTS platform_fee_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_fee_percentage numeric(5,2) DEFAULT 3.50 NOT NULL,
  effective_date timestamp NOT NULL DEFAULT now(),
  created_by uuid REFERENCES super_admins(id),
  created_at timestamp DEFAULT now(),
  notes text
);

-- Platform fee audit log
CREATE TABLE IF NOT EXISTS platform_fee_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_fee numeric(5,2),
  new_fee numeric(5,2),
  changed_by uuid REFERENCES super_admins(id),
  changed_at timestamp DEFAULT now(),
  reason text,
  affected_tenants_count integer DEFAULT 0
);

-- Referral program toggle
CREATE TABLE IF NOT EXISTS referral_program_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT true,
  welcome_discount_percentage numeric(5,2) DEFAULT 2.50,
  disabled_at timestamp,
  disabled_by uuid REFERENCES super_admins(id),
  reason text
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('maintenance_mode', '{"enabled": false}'::jsonb, 'Enable/disable maintenance mode'),
  ('new_signups_enabled', '{"enabled": true}'::jsonb, 'Allow new missionary signups'),
  ('email_notifications_enabled', '{"enabled": true}'::jsonb, 'Platform-wide email notifications'),
  ('referral_program_enabled', '{"enabled": true}'::jsonb, 'Enable referral discount program')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert current platform fee
INSERT INTO platform_fee_config (base_fee_percentage, notes, effective_date)
VALUES (3.50, 'Initial platform fee', now())
ON CONFLICT DO NOTHING;

-- Insert referral program settings
INSERT INTO referral_program_settings (is_enabled, welcome_discount_percentage)
VALUES (true, 2.50)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fee_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fee_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_program_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Super admins can modify system settings" ON system_settings;
DROP POLICY IF EXISTS "Super admins can view fee config" ON platform_fee_config;
DROP POLICY IF EXISTS "Super admins can modify fee config" ON platform_fee_config;
DROP POLICY IF EXISTS "Super admins can view fee audit" ON platform_fee_audit;
DROP POLICY IF EXISTS "Super admins can modify fee audit" ON platform_fee_audit;
DROP POLICY IF EXISTS "Super admins can view referral settings" ON referral_program_settings;
DROP POLICY IF EXISTS "Super admins can modify referral settings" ON referral_program_settings;

-- Create policies
CREATE POLICY "Super admins can view system settings" ON system_settings
  FOR SELECT USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can modify system settings" ON system_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can view fee config" ON platform_fee_config
  FOR SELECT USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can modify fee config" ON platform_fee_config
  FOR ALL USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can view fee audit" ON platform_fee_audit
  FOR SELECT USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can modify fee audit" ON platform_fee_audit
  FOR ALL USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can view referral settings" ON referral_program_settings
  FOR SELECT USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

CREATE POLICY "Super admins can modify referral settings" ON referral_program_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_fee_effective_date ON platform_fee_config(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_fee_audit_changed_at ON platform_fee_audit(changed_at DESC);
