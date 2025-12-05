-- Add Prismic-related columns to homepage_sections table
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'built_in';
-- Values: 'built_in', 'prismic'

ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS prismic_slice_type TEXT;
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS prismic_document_id TEXT;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_homepage_sections_source_type ON homepage_sections(source_type);

COMMENT ON COLUMN homepage_sections.source_type IS 'Source of section content: built_in (our templates) or prismic (from Prismic CMS)';
COMMENT ON COLUMN homepage_sections.prismic_slice_type IS 'The Prismic slice type name when source_type is prismic';
COMMENT ON COLUMN homepage_sections.prismic_document_id IS 'The Prismic document ID containing this slice';

-- Add same columns to page_sections table for all other pages
ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'built_in';
ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS prismic_slice_type TEXT;
ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS prismic_document_id TEXT;

-- Add index for page_sections
CREATE INDEX IF NOT EXISTS idx_page_sections_source_type ON page_sections(source_type);

COMMENT ON COLUMN page_sections.source_type IS 'Source of section content: built_in (our templates) or prismic (from Prismic CMS)';
COMMENT ON COLUMN page_sections.prismic_slice_type IS 'The Prismic slice type name when source_type is prismic';
COMMENT ON COLUMN page_sections.prismic_document_id IS 'The Prismic document ID containing this slice';
