-- Add version history for draft pages
CREATE TABLE IF NOT EXISTS draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES draft_pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  html_content TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draft_id, version_number)
);

-- Create index for faster lookups
CREATE INDEX idx_draft_versions_draft_id ON draft_versions(draft_id);

-- Enable RLS
ALTER TABLE draft_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can view all versions
CREATE POLICY "Super admins can view all versions"
  ON draft_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Policy: Super admins can create versions
CREATE POLICY "Super admins can create versions"
  ON draft_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Function to auto-create version on update
CREATE OR REPLACE FUNCTION create_draft_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content actually changed
  IF OLD.html_content IS DISTINCT FROM NEW.html_content THEN
    INSERT INTO draft_versions (
      draft_id,
      version_number,
      title,
      html_content,
      notes,
      changed_by
    )
    SELECT
      NEW.id,
      COALESCE((
        SELECT MAX(version_number) + 1
        FROM draft_versions
        WHERE draft_id = NEW.id
      ), 1),
      NEW.title,
      NEW.html_content,
      NEW.notes,
      auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create version on update
DROP TRIGGER IF EXISTS draft_version_trigger ON draft_pages;
CREATE TRIGGER draft_version_trigger
  AFTER UPDATE ON draft_pages
  FOR EACH ROW
  EXECUTE FUNCTION create_draft_version();
