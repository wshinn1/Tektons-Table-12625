-- Create footer_settings table
CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL DEFAULT 'Tekton''s Table',
  site_subtitle TEXT DEFAULT 'Built by storytellers for storytellers in God''s kingdom.',
  
  -- Product column
  product_column_title TEXT DEFAULT 'Product',
  product_links JSONB DEFAULT '[
    {"label": "Features", "url": "/features"},
    {"label": "Pricing", "url": "/pricing"},
    {"label": "Example", "url": "/example"}
  ]'::jsonb,
  
  -- Company column
  company_column_title TEXT DEFAULT 'Company',
  company_links JSONB DEFAULT '[
    {"label": "About", "url": "/about"},
    {"label": "Privacy", "url": "/privacy"},
    {"label": "Terms", "url": "/terms"}
  ]'::jsonb,
  
  -- Connect column
  connect_column_title TEXT DEFAULT 'Connect',
  connect_links JSONB DEFAULT '[
    {"label": "Contact", "url": "/contact"},
    {"label": "Blog", "url": "/blog"},
    {"label": "Login", "url": "/auth/login"}
  ]'::jsonb,
  
  copyright_text TEXT DEFAULT '© 2025 Tekton''s Table. All rights reserved.',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view footer settings"
  ON footer_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage footer settings"
  ON footer_settings
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM super_admins
    )
  );

-- Insert default settings
INSERT INTO footer_settings (site_title, site_subtitle)
VALUES ('Tekton''s Table', 'Built by storytellers for storytellers in God''s kingdom.')
ON CONFLICT DO NOTHING;
