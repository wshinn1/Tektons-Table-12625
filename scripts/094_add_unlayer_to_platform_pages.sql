-- Migration: Add Unlayer page builder support to platform pages
-- This adds columns to support visual page building with Unlayer on tektonstable.com

-- Add new columns to the pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS design_json JSONB,
ADD COLUMN IF NOT EXISTS html_content TEXT,
ADD COLUMN IF NOT EXISTS editor_type TEXT DEFAULT 'sections';

-- Add comments for documentation
COMMENT ON COLUMN pages.design_json IS 'Unlayer editor JSON state for re-editing pages';
COMMENT ON COLUMN pages.html_content IS 'Rendered HTML content from Unlayer editor';
COMMENT ON COLUMN pages.editor_type IS 'Page editor type: sections (default modular system) or unlayer (visual builder)';

-- Create an index for faster filtering by editor type
CREATE INDEX IF NOT EXISTS idx_pages_editor_type ON pages(editor_type);

-- Update existing pages to have 'sections' as their editor_type
UPDATE pages SET editor_type = 'sections' WHERE editor_type IS NULL;

-- Add a constraint to ensure valid editor types
ALTER TABLE pages
ADD CONSTRAINT pages_editor_type_check 
CHECK (editor_type IN ('sections', 'unlayer'));
