-- Complete Builder.io setup script
-- This script checks if columns exist before adding them, so it's safe to run multiple times

-- First, check if homepage_sections table has the columns we need
-- If they don't exist, create them

-- Add source_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'homepage_sections' 
                   AND column_name = 'source_type') THEN
        ALTER TABLE homepage_sections ADD COLUMN source_type TEXT DEFAULT 'built_in';
    END IF;
END $$;

-- Add builder_section_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'homepage_sections' 
                   AND column_name = 'builder_section_id') THEN
        ALTER TABLE homepage_sections ADD COLUMN builder_section_id TEXT;
    END IF;
END $$;

-- Add custom_code column for screenshot feature if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'homepage_sections' 
                   AND column_name = 'custom_code') THEN
        ALTER TABLE homepage_sections ADD COLUMN custom_code TEXT;
    END IF;
END $$;

-- If prismic columns exist, migrate them to builder columns
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'homepage_sections' 
               AND column_name = 'prismic_slice_type') THEN
        -- Copy data from prismic column to builder column
        UPDATE homepage_sections 
        SET builder_section_id = prismic_slice_type 
        WHERE prismic_slice_type IS NOT NULL;
        
        -- Drop the old column
        ALTER TABLE homepage_sections DROP COLUMN prismic_slice_type;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'homepage_sections' 
               AND column_name = 'prismic_document_id') THEN
        ALTER TABLE homepage_sections DROP COLUMN prismic_document_id;
    END IF;
END $$;

-- Update any prismic source types to builder_io
UPDATE homepage_sections 
SET source_type = 'builder_io' 
WHERE source_type = 'prismic';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_homepage_sections_source_type ON homepage_sections(source_type);

-- Add comments
COMMENT ON COLUMN homepage_sections.source_type IS 'Source of section content: built_in, builder_io, or screenshot';
COMMENT ON COLUMN homepage_sections.builder_section_id IS 'The Builder.io section ID when source_type is builder_io';
COMMENT ON COLUMN homepage_sections.custom_code IS 'Custom React/JSX code for screenshot-generated sections';

-- Now do the same for page_sections table

-- Add source_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'page_sections' 
                   AND column_name = 'source_type') THEN
        ALTER TABLE page_sections ADD COLUMN source_type TEXT DEFAULT 'built_in';
    END IF;
END $$;

-- Add builder_section_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'page_sections' 
                   AND column_name = 'builder_section_id') THEN
        ALTER TABLE page_sections ADD COLUMN builder_section_id TEXT;
    END IF;
END $$;

-- Add custom_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'page_sections' 
                   AND column_name = 'custom_code') THEN
        ALTER TABLE page_sections ADD COLUMN custom_code TEXT;
    END IF;
END $$;

-- If prismic columns exist, migrate them
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'page_sections' 
               AND column_name = 'prismic_slice_type') THEN
        UPDATE page_sections 
        SET builder_section_id = prismic_slice_type 
        WHERE prismic_slice_type IS NOT NULL;
        
        ALTER TABLE page_sections DROP COLUMN prismic_slice_type;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'page_sections' 
               AND column_name = 'prismic_document_id') THEN
        ALTER TABLE page_sections DROP COLUMN prismic_document_id;
    END IF;
END $$;

-- Update any prismic source types to builder_io
UPDATE page_sections 
SET source_type = 'builder_io' 
WHERE source_type = 'prismic';

-- Create index
CREATE INDEX IF NOT EXISTS idx_page_sections_source_type ON page_sections(source_type);

-- Add comments
COMMENT ON COLUMN page_sections.source_type IS 'Source of section content: built_in, builder_io, or screenshot';
COMMENT ON COLUMN page_sections.builder_section_id IS 'The Builder.io section ID when source_type is builder_io';
COMMENT ON COLUMN page_sections.custom_code IS 'Custom React/JSX code for screenshot-generated sections';
