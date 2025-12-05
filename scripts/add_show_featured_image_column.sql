-- Add show_featured_image column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS show_featured_image BOOLEAN DEFAULT true;

-- Update existing posts to show featured image by default
UPDATE blog_posts 
SET show_featured_image = true 
WHERE show_featured_image IS NULL;
