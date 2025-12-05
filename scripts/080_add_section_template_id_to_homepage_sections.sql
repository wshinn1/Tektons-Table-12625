-- Add section_template_id column to homepage_sections if it doesn't exist
ALTER TABLE homepage_sections 
ADD COLUMN IF NOT EXISTS section_template_id UUID REFERENCES section_templates(id) ON DELETE SET NULL;

-- Add index for the foreign key
CREATE INDEX IF NOT EXISTS idx_homepage_sections_template ON homepage_sections(section_template_id);

-- Comment for documentation
COMMENT ON COLUMN homepage_sections.section_template_id IS 'Reference to section_templates for built-in sections';
