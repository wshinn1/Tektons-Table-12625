-- Create table for per-page metadata overrides
CREATE TABLE IF NOT EXISTS page_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE, -- e.g., 'homepage', 'pricing', 'how-it-works'
  page_name TEXT NOT NULL,
  page_path TEXT NOT NULL, -- e.g., '/', '/pricing', '/how-it-works'
  
  -- SEO
  title TEXT,
  description TEXT,
  keywords TEXT[],
  
  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website',
  
  -- Twitter
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,
  
  -- Settings
  use_global_defaults BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pages
INSERT INTO page_metadata (page_key, page_name, page_path, use_global_defaults, title, description) VALUES
  ('homepage', 'Homepage', '/', true, 'Tektons Table - Missionary Fundraising Platform', 'Multi-tenant missionary fundraising platform with zero subscription fees'),
  ('pricing', 'Pricing', '/pricing', true, 'Pricing Comparison | Tektons Table', 'Compare TektonStable fundraising fees with GoFundMe, Patreon, and other platforms'),
  ('how-it-works', 'How It Works', '/how-it-works', true, 'How It Works | Tektons Table', 'Launch your missionary fundraising site in minutes'),
  ('help', 'Help Center', '/help', true, 'Help Center | Tektons Table', 'Get help and support for your fundraising site'),
  ('blog', 'Blog', '/blog', true, 'Blog | Tektons Table', 'Latest updates and stories from missionaries'),
  ('security', 'Security', '/security', true, 'Security | Tektons Table', 'How we keep your data and donations secure'),
  ('privacy', 'Privacy Policy', '/privacy', true, 'Privacy Policy | Tektons Table', 'Our commitment to protecting your privacy'),
  ('terms', 'Terms & Conditions', '/terms', true, 'Terms & Conditions | Tektons Table', 'Terms of service for using Tektons Table')
ON CONFLICT (page_key) DO NOTHING;

-- Add RLS policies
ALTER TABLE page_metadata ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins can manage page metadata"
  ON page_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = auth.uid()
      AND tenants.is_super_admin = true
    )
  );

-- Everyone can read active pages
CREATE POLICY "Anyone can read active page metadata"
  ON page_metadata
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create function to get metadata for a page (with fallback to globals)
CREATE OR REPLACE FUNCTION get_page_metadata(p_page_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_page_meta page_metadata;
  v_global_meta JSONB;
  v_result JSONB;
BEGIN
  -- Get page-specific metadata
  SELECT * INTO v_page_meta
  FROM page_metadata
  WHERE page_key = p_page_key
  AND is_active = true;
  
  -- Get global defaults
  SELECT value INTO v_global_meta
  FROM system_settings
  WHERE key = 'site_metadata';
  
  -- If page not found or uses global defaults, return globals
  IF v_page_meta IS NULL OR v_page_meta.use_global_defaults THEN
    RETURN v_global_meta;
  END IF;
  
  -- Merge page-specific with globals (page-specific takes precedence)
  v_result := jsonb_build_object(
    'title', COALESCE(v_page_meta.title, v_global_meta->>'title'),
    'description', COALESCE(v_page_meta.description, v_global_meta->>'description'),
    'keywords', COALESCE(v_page_meta.keywords, ARRAY[]::TEXT[]),
    'og_title', COALESCE(v_page_meta.og_title, v_page_meta.title, v_global_meta->>'og_title'),
    'og_description', COALESCE(v_page_meta.og_description, v_page_meta.description, v_global_meta->>'og_description'),
    'og_image_url', COALESCE(v_page_meta.og_image_url, v_global_meta->>'og_image_url'),
    'og_type', COALESCE(v_page_meta.og_type, 'website'),
    'twitter_card', COALESCE(v_page_meta.twitter_card, 'summary_large_image'),
    'twitter_title', COALESCE(v_page_meta.twitter_title, v_page_meta.og_title, v_page_meta.title, v_global_meta->>'twitter_title'),
    'twitter_description', COALESCE(v_page_meta.twitter_description, v_page_meta.og_description, v_page_meta.description, v_global_meta->>'twitter_description'),
    'twitter_image_url', COALESCE(v_page_meta.twitter_image_url, v_page_meta.og_image_url, v_global_meta->>'twitter_image_url'),
    'favicon_url', v_global_meta->>'favicon_url'
  );
  
  RETURN v_result;
END;
$$;
