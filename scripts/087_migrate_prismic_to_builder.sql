-- Migrate Prismic columns to Builder.io
-- Rename prismic columns to builder columns

-- Homepage sections
ALTER TABLE homepage_sections 
  RENAME COLUMN prismic_slice_type TO builder_section_id;

ALTER TABLE homepage_sections 
  DROP COLUMN IF EXISTS prismic_document_id;

-- Update source_type values
UPDATE homepage_sections 
SET source_type = 'builder_io' 
WHERE source_type = 'prismic';

-- Page sections
ALTER TABLE page_sections 
  RENAME COLUMN prismic_slice_type TO builder_section_id;

ALTER TABLE page_sections 
  DROP COLUMN IF EXISTS prismic_document_id;

-- Update source_type values
UPDATE page_sections 
SET source_type = 'builder_io' 
WHERE source_type = 'prismic';

-- Update comments
COMMENT ON COLUMN homepage_sections.source_type IS 'Source of section content: built_in, builder_io, or screenshot';
COMMENT ON COLUMN homepage_sections.builder_section_id IS 'The Builder.io section ID when source_type is builder_io';

COMMENT ON COLUMN page_sections.source_type IS 'Source of section content: built_in, builder_io, or screenshot';
COMMENT ON COLUMN page_sections.builder_section_id IS 'The Builder.io section ID when source_type is builder_io';
