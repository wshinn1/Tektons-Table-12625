-- Phase 11: Support & Documentation System

-- Help Articles
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL, -- Multi-language: {"en": "...", "es": "..."}
  content JSONB NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  related_articles UUID[],
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Help Categories
CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Help Article Feedback
CREATE TABLE IF NOT EXISTS help_article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES help_articles(id),
  user_id UUID REFERENCES tenants(id),
  was_helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_published ON help_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);

-- RLS Policies
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_feedback ENABLE ROW LEVEL SECURITY;

-- Everyone can read published articles
DROP POLICY IF EXISTS help_articles_select_published ON help_articles;
CREATE POLICY help_articles_select_published ON help_articles
  FOR SELECT USING (is_published = true);

-- Everyone can read categories
DROP POLICY IF EXISTS help_categories_select ON help_categories;
CREATE POLICY help_categories_select ON help_categories
  FOR SELECT USING (true);

-- Users can submit feedback
DROP POLICY IF EXISTS help_feedback_insert ON help_article_feedback;
CREATE POLICY help_feedback_insert ON help_article_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Super admins can manage all help content
DROP POLICY IF EXISTS help_articles_super_admin_all ON help_articles;
CREATE POLICY help_articles_super_admin_all ON help_articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS help_categories_super_admin_all ON help_categories;
CREATE POLICY help_categories_super_admin_all ON help_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE id = auth.uid())
  );
