-- Phase 1: Add new fields for Medium-style blog layout
-- subtitle, read_time, engagement metrics

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS claps_count INTEGER DEFAULT 0;

-- Create table for tracking claps/likes
CREATE TABLE IF NOT EXISTS blog_post_claps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clap_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_blog_post_claps_post_id ON blog_post_claps(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_claps_user_id ON blog_post_claps(user_id);

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts SET views_count = views_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on claps table
ALTER TABLE blog_post_claps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read claps
CREATE POLICY "Anyone can read claps" ON blog_post_claps FOR SELECT USING (true);

-- Allow authenticated users to insert/update their own claps
CREATE POLICY "Users can manage their own claps" ON blog_post_claps
FOR ALL USING (auth.uid() = user_id);
