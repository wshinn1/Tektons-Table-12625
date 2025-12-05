-- Create page_sections table for storing reusable sections
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  section_type TEXT NOT NULL,
  thumbnail_url TEXT,
  original_screenshot_url TEXT,
  fields JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  html_preview TEXT,
  is_template BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'custom',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create page_section_instances for tracking where sections are used
CREATE TABLE IF NOT EXISTS page_section_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES page_sections(id) ON DELETE CASCADE,
  page_identifier TEXT NOT NULL, -- e.g., 'homepage', 'about', 'pricing'
  position INTEGER NOT NULL DEFAULT 0,
  field_overrides JSONB DEFAULT '{}', -- Per-instance customizations
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_sections_type ON page_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_page_sections_category ON page_sections(category);
CREATE INDEX IF NOT EXISTS idx_page_sections_template ON page_sections(is_template);
CREATE INDEX IF NOT EXISTS idx_page_section_instances_page ON page_section_instances(page_identifier);
CREATE INDEX IF NOT EXISTS idx_page_section_instances_section ON page_section_instances(section_id);

-- RLS policies
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_section_instances ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all sections
CREATE POLICY "Super admins can manage sections" ON page_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Super admins can manage section instances" ON page_section_instances
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

-- Public can view published sections (for rendering)
CREATE POLICY "Public can view sections" ON page_sections
  FOR SELECT USING (true);

CREATE POLICY "Public can view section instances" ON page_section_instances
  FOR SELECT USING (is_visible = true);
