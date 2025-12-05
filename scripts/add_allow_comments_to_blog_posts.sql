-- Add allow_comments column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN blog_posts.allow_comments IS 'Controls whether comments are enabled for this blog post. Defaults to true for tenant sites.';
