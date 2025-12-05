-- Add is_homepage column to pages table to allow designating any page as homepage
-- Only one page can be the homepage at a time

-- Add the column
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_homepage BOOLEAN DEFAULT false;

-- Create unique partial index to ensure only one homepage exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_one_homepage 
  ON pages(is_homepage) 
  WHERE is_homepage = true;

-- Set the current 'home' page as the homepage
UPDATE pages SET is_homepage = true WHERE slug = 'home';

-- Add comment
COMMENT ON COLUMN pages.is_homepage IS 'Designates which page is the homepage. Only one page can have is_homepage = true.';
