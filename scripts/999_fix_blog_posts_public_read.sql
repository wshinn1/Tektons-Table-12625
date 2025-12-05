-- Ensure blog_posts table has RLS enabled
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing blog_posts SELECT policies to start fresh
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON blog_posts;', ' ')
    FROM pg_policies 
    WHERE tablename = 'blog_posts' AND cmd = 'SELECT'
  );
END $$;

-- Create a simple public read policy for published posts
-- This allows ANYONE (anon or authenticated) to read published blog posts
CREATE POLICY "allow_public_read_published_posts" 
ON blog_posts 
FOR SELECT 
TO public
USING (status = 'published');
