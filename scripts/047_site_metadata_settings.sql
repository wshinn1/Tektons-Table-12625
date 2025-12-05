-- Site-wide metadata settings for tektonstable.com

-- Add site metadata settings to system_settings table
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  (
    'site_metadata',
    '{
      "title": "Tektons Table - Missionary Fundraising Platform",
      "description": "Empower your mission with a beautifully designed fundraising platform. Accept donations, share updates, and build lasting supporter relationships.",
      "favicon_url": "/favicon.ico",
      "og_image": "/og-image.png",
      "twitter_card": "summary_large_image",
      "twitter_site": "@tektonstable"
    }'::jsonb,
    'Main site metadata including title, description, favicon, and social sharing settings'
  )
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_metadata ON system_settings(setting_key) WHERE setting_key = 'site_metadata';
