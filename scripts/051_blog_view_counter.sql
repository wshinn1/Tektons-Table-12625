-- Add view counter function for blog posts
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS void
LANGUAGE plpgsql
-- Removed SECURITY DEFINER to follow security best practices
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- Added explicit permissions for authenticated and anonymous users
GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_blog_views(UUID) TO anon;
