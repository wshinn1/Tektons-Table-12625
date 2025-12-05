-- Add excerpt column to blog_posts table for social sharing
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;

COMMENT ON COLUMN blog_posts.excerpt IS 'Short excerpt for social sharing and previews';
