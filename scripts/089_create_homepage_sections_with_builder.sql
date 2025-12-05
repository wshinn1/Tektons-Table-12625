-- Create homepage_sections table with Builder.io support from scratch
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  background_type TEXT DEFAULT 'color',
  background_value TEXT,
  button_text TEXT,
  button_url TEXT,
  button_color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Builder.io / Visual Builder Support
  source_type TEXT DEFAULT 'built_in', -- 'built_in', 'builder_io', 'screenshot'
  builder_content_id TEXT, -- Builder.io content/model ID
  builder_content JSONB, -- Full Builder.io content
  custom_code TEXT, -- For screenshot-generated sections
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_source ON homepage_sections(source_type);

-- Enable RLS
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all homepage sections
CREATE POLICY "Super admins can manage homepage sections" ON homepage_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

-- Public can view active sections
CREATE POLICY "Public can view active homepage sections" ON homepage_sections
  FOR SELECT USING (is_active = true);

-- Also update page_sections table if it exists
DO $$ 
BEGIN
  -- Add Builder.io columns to page_sections if the table exists
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'page_sections') THEN
    -- Add source_type if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'page_sections' AND column_name = 'source_type') THEN
      ALTER TABLE page_sections ADD COLUMN source_type TEXT DEFAULT 'built_in';
    END IF;
    
    -- Add builder_content_id if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'page_sections' AND column_name = 'builder_content_id') THEN
      ALTER TABLE page_sections ADD COLUMN builder_content_id TEXT;
    END IF;
    
    -- Add builder_content if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'page_sections' AND column_name = 'builder_content') THEN
      ALTER TABLE page_sections ADD COLUMN builder_content JSONB;
    END IF;
    
    -- Add custom_code if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'page_sections' AND column_name = 'custom_code') THEN
      ALTER TABLE page_sections ADD COLUMN custom_code TEXT;
    END IF;
    
    -- Create index
    CREATE INDEX IF NOT EXISTS idx_page_sections_source ON page_sections(source_type);
  END IF;
END $$;
