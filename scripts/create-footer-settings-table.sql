-- Create footer_settings table
CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL DEFAULT 'Tekton''s Table',
  site_subtitle TEXT NOT NULL DEFAULT 'Built by storytellers for storytellers in God''s kingdom.',
  copyright_text TEXT NOT NULL DEFAULT 'Tekton''s Table. All rights reserved.',
  menu_columns JSONB NOT NULL DEFAULT '[
    {
      "title": "Product",
      "links": [
        {"label": "Features", "url": "/#features"},
        {"label": "Pricing", "url": "/pricing"},
        {"label": "Example", "url": "/example"}
      ]
    },
    {
      "title": "Company",
      "links": [
        {"label": "About", "url": "/about"},
        {"label": "Privacy", "url": "/privacy"},
        {"label": "Terms", "url": "/terms"}
      ]
    },
    {
      "title": "Connect",
      "links": [
        {"label": "Contact", "url": "/support"},
        {"label": "Blog", "url": "/blog"},
        {"label": "Login", "url": "/auth/login"}
      ]
    }
  ]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read footer settings"
  ON footer_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Super admins can manage footer settings"
  ON footer_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Insert default footer settings if none exist
INSERT INTO footer_settings (id, site_title, site_subtitle, copyright_text)
SELECT gen_random_uuid(), 'Tekton''s Table', 'Built by storytellers for storytellers in God''s kingdom.', 'Tekton''s Table. All rights reserved.'
WHERE NOT EXISTS (SELECT 1 FROM footer_settings);
