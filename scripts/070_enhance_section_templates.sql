-- Enhance section_templates table for AI-generated sections
-- Add columns if they don't exist

DO $$
BEGIN
  -- Add source_type to track how the section was created
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'section_templates' AND column_name = 'source_type') THEN
    ALTER TABLE section_templates ADD COLUMN source_type TEXT DEFAULT 'manual';
  END IF;

  -- Add original_screenshot_url to store the source screenshot
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'section_templates' AND column_name = 'original_screenshot_url') THEN
    ALTER TABLE section_templates ADD COLUMN original_screenshot_url TEXT;
  END IF;

  -- Add editable_fields to define what can be edited
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'section_templates' AND column_name = 'editable_fields') THEN
    ALTER TABLE section_templates ADD COLUMN editable_fields JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add generated_html for the AI-generated HTML
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'section_templates' AND column_name = 'generated_html') THEN
    ALTER TABLE section_templates ADD COLUMN generated_html TEXT;
  END IF;

  -- Add generated_css for any custom styles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'section_templates' AND column_name = 'generated_css') THEN
    ALTER TABLE section_templates ADD COLUMN generated_css TEXT;
  END IF;
END $$;

-- Update RLS policies if needed
DO $$
BEGIN
  -- Ensure super admins can manage section templates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'section_templates' AND policyname = 'Super admins can manage section templates'
  ) THEN
    CREATE POLICY "Super admins can manage section templates"
      ON section_templates FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM super_admins WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;
