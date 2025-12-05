-- Create homepage_sections table if it doesn't exist
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  section_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Builder.io columns
  source_type TEXT DEFAULT 'built_in',
  builder_content_id TEXT,
  custom_code TEXT,
  
  UNIQUE(section_order)
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(section_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_source ON homepage_sections(source_type);

-- Add Builder.io columns to page_sections if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_sections') THEN
    ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'built_in';
    ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS builder_content_id TEXT;
    ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS custom_code TEXT;
    
    CREATE INDEX IF NOT EXISTS idx_page_sections_source ON page_sections(source_type);
  END IF;
END $$;

-- Enable RLS (basic setup)
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Anyone can view active homepage sections" ON homepage_sections;

-- Allow public read access to active sections
CREATE POLICY "Anyone can view active homepage sections"
  ON homepage_sections FOR SELECT
  USING (is_active = true);

-- Comments for documentation
COMMENT ON COLUMN homepage_sections.source_type IS 'Source of section: built_in, builder, or screenshot';
COMMENT ON COLUMN homepage_sections.builder_content_id IS 'Builder.io content ID when source_type is builder';
COMMENT ON COLUMN homepage_sections.custom_code IS 'Custom React/JSX code when source_type is screenshot';
