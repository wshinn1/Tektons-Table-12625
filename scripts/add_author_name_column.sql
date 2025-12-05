-- Add author_name column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN blog_posts.author_name IS 'Display name of the blog post author';
