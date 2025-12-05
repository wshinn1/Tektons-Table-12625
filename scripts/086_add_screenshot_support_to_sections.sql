-- Add support for screenshot-generated custom sections
ALTER TABLE homepage_sections ADD COLUMN IF NOT EXISTS custom_code TEXT;
ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS custom_code TEXT;

-- Update source_type to include 'screenshot'
COMMENT ON COLUMN homepage_sections.source_type IS 'Source of section content: built_in (our templates), prismic (from Prismic CMS), or screenshot (AI-generated from image)';
COMMENT ON COLUMN page_sections.source_type IS 'Source of section content: built_in (our templates), prismic (from Prismic CMS), or screenshot (AI-generated from image)';

COMMENT ON COLUMN homepage_sections.custom_code IS 'Custom React/JSX code for screenshot-generated sections';
COMMENT ON COLUMN page_sections.custom_code IS 'Custom React/JSX code for screenshot-generated sections';
