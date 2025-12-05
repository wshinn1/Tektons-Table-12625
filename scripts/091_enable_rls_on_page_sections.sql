-- This script is no longer needed - page_sections already has RLS enabled in script 069
-- If you're seeing RLS warnings, the table may have been created without running script 069

-- Check if RLS is enabled and enable it if not
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'page_sections'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Recreate policies (drop and recreate to ensure they're correct)
DROP POLICY IF EXISTS "Public can view sections" ON page_sections;
DROP POLICY IF EXISTS "Super admins can manage sections" ON page_sections;
DROP POLICY IF EXISTS "Authenticated users can manage sections" ON page_sections;

-- Allow public to view all sections (for rendering pages)
CREATE POLICY "Public can view sections" ON page_sections
  FOR SELECT USING (true);

-- Allow authenticated users to manage sections (no super_admins dependency)
CREATE POLICY "Authenticated users can manage sections" ON page_sections
  FOR ALL 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
