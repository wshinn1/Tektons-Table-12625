-- Phase 14: Enhanced Content Organization - Categories & Topics System
-- Adds color, icons, display order, visibility controls, and post counts

-- Add new columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'folder';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add post_count to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- Create function to update topic post counts
CREATE OR REPLACE FUNCTION update_topic_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics 
    SET post_count = post_count + 1 
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics 
    SET post_count = post_count - 1 
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain topic post counts
DROP TRIGGER IF EXISTS maintain_topic_post_count ON post_topics;
CREATE TRIGGER maintain_topic_post_count
  AFTER INSERT OR DELETE ON post_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_post_count();

-- Insert default categories for new tenants (if they don't exist)
-- This will be run when a tenant is created, but we can add defaults here too

-- Create index for display order
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(tenant_id, display_order);

-- Update RLS policies to allow public reading of categories and topics for tenant sites
DROP POLICY IF EXISTS "Public can view visible categories" ON categories;
CREATE POLICY "Public can view visible categories" ON categories 
  FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Public can view topics" ON topics;
CREATE POLICY "Public can view topics" ON topics 
  FOR SELECT USING (true);

-- Allow reading post_topics for filtering
ALTER TABLE post_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view post topics" ON post_topics;
CREATE POLICY "Public can view post topics" ON post_topics 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tenants can manage their post topics" ON post_topics;
CREATE POLICY "Tenants can manage their post topics" ON post_topics 
  FOR ALL USING (
    post_id IN (
      SELECT id FROM posts WHERE tenant_id = auth.uid()
    )
  );
