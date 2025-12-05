-- Add navigation settings table for logo configuration
CREATE TABLE IF NOT EXISTS public.navigation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_type TEXT NOT NULL DEFAULT 'image' CHECK (logo_type IN ('image', 'text')),
  logo_text TEXT DEFAULT 'TektonStable',
  logo_image_url TEXT DEFAULT '/tektons-table-logo.png',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings if none exist
INSERT INTO navigation_settings (logo_type, logo_text, logo_image_url)
SELECT 'image', 'TektonStable', '/tektons-table-logo.png'
WHERE NOT EXISTS (SELECT 1 FROM navigation_settings LIMIT 1);

-- Enable RLS
ALTER TABLE navigation_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read navigation_settings" ON navigation_settings;
CREATE POLICY "Allow public read navigation_settings" ON navigation_settings
  FOR SELECT USING (true);

-- Allow authenticated users to update (admins)
DROP POLICY IF EXISTS "Allow authenticated update navigation_settings" ON navigation_settings;
CREATE POLICY "Allow authenticated update navigation_settings" ON navigation_settings
  FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- Seed default menu items if the table is empty
INSERT INTO menu_items (label, url, position, published, navigation_side, is_dropdown)
SELECT label, url, position, published, navigation_side, is_dropdown FROM (VALUES
  ('About', '/about', 1, true, 'left', false),
  ('How It Works', '/how-it-works', 2, true, 'left', false),
  ('Pricing', '/pricing', 3, true, 'left', false),
  ('Security', '/security', 4, true, 'left', false),
  ('Blog', '/blog', 5, true, 'left', false),
  ('Help', '/help', 6, true, 'left', false)
) AS default_items(label, url, position, published, navigation_side, is_dropdown)
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE tenant_id IS NULL LIMIT 1);
