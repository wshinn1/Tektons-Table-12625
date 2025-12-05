-- Add platform fee configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default platform fee (3.5%)
INSERT INTO platform_settings (setting_key, setting_value)
VALUES ('platform_fee_percentage', '3.5')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read platform settings
CREATE POLICY "Anyone can read platform settings"
  ON platform_settings
  FOR SELECT
  USING (true);

-- Only authenticated users (admins) can update
CREATE POLICY "Only authenticated users can update platform settings"
  ON platform_settings
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);
