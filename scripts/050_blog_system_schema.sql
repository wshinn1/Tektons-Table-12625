-- Blog System Database Schema
-- Creates tables for blog posts, categories, tags, reactions, and comments
-- Supports both platform blogs (super admins) and tenant blogs

-- Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL, -- 'platform' for main site, tenant UUID for tenant blogs
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_tenant_id ON blog_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Blog Tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_tags_tenant_id ON blog_tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb, -- BlockNote JSON content
  featured_image_url TEXT,
  featured_image_caption TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  read_time_minutes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_id ON blog_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Blog Post Categories (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blog_post_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_categories_post_id ON blog_post_categories(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category_id ON blog_post_categories(category_id);

-- Blog Post Tags (many-to-many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blog_post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON blog_post_tags(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);

-- Blog Post Reactions (claps/likes)
CREATE TABLE IF NOT EXISTS blog_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'clap' CHECK (reaction_type IN ('clap', 'like', 'love')),
  count INTEGER NOT NULL DEFAULT 1, -- Allow multiple claps from same user (Medium-style)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(blog_post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_reactions_post_id ON blog_post_reactions(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_reactions_user_id ON blog_post_reactions(user_id);

-- Blog Post Comments
CREATE TABLE IF NOT EXISTS blog_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES blog_post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_post_comments_post_id ON blog_post_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_comments_author_id ON blog_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_comments_parent_id ON blog_post_comments(parent_comment_id);

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
DROP POLICY IF EXISTS "Public read access to categories" ON blog_categories;
CREATE POLICY "Public read access to categories" ON blog_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins full access to platform categories" ON blog_categories;
CREATE POLICY "Super admins full access to platform categories" ON blog_categories
  FOR ALL USING (
    tenant_id = 'platform' AND 
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Tenant users full access to their categories" ON blog_categories;
CREATE POLICY "Tenant users full access to their categories" ON blog_categories
  FOR ALL USING (
    tenant_id != 'platform' AND
    EXISTS (
      SELECT 1 FROM supporter_profiles 
      WHERE supporter_profiles.tenant_id::text = blog_categories.tenant_id 
      AND supporter_profiles.id = auth.uid()
    )
  );

-- RLS Policies for blog_tags
DROP POLICY IF EXISTS "Public read access to tags" ON blog_tags;
CREATE POLICY "Public read access to tags" ON blog_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins full access to platform tags" ON blog_tags;
CREATE POLICY "Super admins full access to platform tags" ON blog_tags
  FOR ALL USING (
    tenant_id = 'platform' AND 
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Tenant users full access to their tags" ON blog_tags;
CREATE POLICY "Tenant users full access to their tags" ON blog_tags
  FOR ALL USING (
    tenant_id != 'platform' AND
    EXISTS (
      SELECT 1 FROM supporter_profiles 
      WHERE supporter_profiles.tenant_id::text = blog_tags.tenant_id 
      AND supporter_profiles.id = auth.uid()
    )
  );

-- RLS Policies for blog_posts
DROP POLICY IF EXISTS "Public read access to published posts" ON blog_posts;
CREATE POLICY "Public read access to published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Super admins full access to platform posts" ON blog_posts;
CREATE POLICY "Super admins full access to platform posts" ON blog_posts
  FOR ALL USING (
    tenant_id = 'platform' AND 
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Tenant users full access to their posts" ON blog_posts;
CREATE POLICY "Tenant users full access to their posts" ON blog_posts
  FOR ALL USING (
    tenant_id != 'platform' AND
    EXISTS (
      SELECT 1 FROM supporter_profiles 
      WHERE supporter_profiles.tenant_id::text = blog_posts.tenant_id 
      AND supporter_profiles.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can manage their own posts" ON blog_posts;
CREATE POLICY "Authors can manage their own posts" ON blog_posts
  FOR ALL USING (author_id = auth.uid());

-- RLS Policies for blog_post_categories
DROP POLICY IF EXISTS "Public read access to post categories" ON blog_post_categories;
CREATE POLICY "Public read access to post categories" ON blog_post_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage post categories" ON blog_post_categories;
CREATE POLICY "Authenticated users can manage post categories" ON blog_post_categories
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for blog_post_tags
DROP POLICY IF EXISTS "Public read access to post tags" ON blog_post_tags;
CREATE POLICY "Public read access to post tags" ON blog_post_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON blog_post_tags;
CREATE POLICY "Authenticated users can manage post tags" ON blog_post_tags
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for blog_post_reactions
DROP POLICY IF EXISTS "Public read access to reactions" ON blog_post_reactions;
CREATE POLICY "Public read access to reactions" ON blog_post_reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage their reactions" ON blog_post_reactions;
CREATE POLICY "Authenticated users can manage their reactions" ON blog_post_reactions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for blog_post_comments
DROP POLICY IF EXISTS "Public read access to published comments" ON blog_post_comments;
CREATE POLICY "Public read access to published comments" ON blog_post_comments
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can create comments" ON blog_post_comments;
CREATE POLICY "Authenticated users can create comments" ON blog_post_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can manage their own comments" ON blog_post_comments;
CREATE POLICY "Authors can manage their own comments" ON blog_post_comments
  FOR ALL USING (author_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_post_reactions_updated_at ON blog_post_reactions;
CREATE TRIGGER update_blog_post_reactions_updated_at
  BEFORE UPDATE ON blog_post_reactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_post_comments_updated_at ON blog_post_comments;
CREATE TRIGGER update_blog_post_comments_updated_at
  BEFORE UPDATE ON blog_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
