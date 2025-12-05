-- Draft Pages System for HTML Content Planning
-- This allows admins to create and manage draft HTML pages before building production components

CREATE TABLE IF NOT EXISTS draft_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'marketing', -- 'marketing', 'legal', 'support', 'about'
  html_content TEXT NOT NULL DEFAULT '',
  notes TEXT, -- Internal planning notes
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved'
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_draft_pages_slug ON draft_pages(slug);
CREATE INDEX IF NOT EXISTS idx_draft_pages_category ON draft_pages(category);
CREATE INDEX IF NOT EXISTS idx_draft_pages_status ON draft_pages(status);

-- Enable RLS
ALTER TABLE draft_pages ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins can manage draft pages"
  ON draft_pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_draft_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER draft_pages_updated_at
  BEFORE UPDATE ON draft_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_pages_updated_at();
