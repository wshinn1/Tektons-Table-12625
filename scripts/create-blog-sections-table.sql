-- Create blog_page_sections table for platform blog page
CREATE TABLE IF NOT EXISTS blog_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blog_page_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active blog page sections" 
  ON blog_page_sections FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage blog page sections" 
  ON blog_page_sections FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default sections
INSERT INTO blog_page_sections (section_key, section_type, title, content, display_order) VALUES
  ('blog_hero_slider', 'blog_hero_slider', 'Blog Hero Slider', '{"tagline": "TEKTON''S TABLE, personal editorial daily magazine.", "highlightWord": "editorial"}', 0),
  ('blog_featured_post', 'blog_featured_post', 'Featured Blog Post', '{"featuredPostId": null}', 1),
  ('blog_masonry', 'blog_masonry', 'Blog Masonry Grid', '{"columns": 2, "rows": 2}', 2)
ON CONFLICT (section_key) DO NOTHING;
