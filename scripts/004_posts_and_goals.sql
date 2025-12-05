-- Phase 4: Posts, Goals, and Enhanced Tracking
-- Add categories, topics, and funding goals

-- Add categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Add topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Add post_topics junction table
CREATE TABLE IF NOT EXISTS post_topics (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, topic_id)
);

-- Add funding_goals table
CREATE TABLE IF NOT EXISTS funding_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount INTEGER NOT NULL, -- in cents
  current_amount INTEGER DEFAULT 0, -- in cents
  deadline DATE,
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update posts table with category support
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_topics_tenant ON topics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_post ON post_topics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_topic ON post_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_funding_goals_tenant ON funding_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);

-- RLS Policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_own" ON categories;
-- Fixed RLS policy to use tenant_id = auth.uid() instead of checking user_id
CREATE POLICY "categories_select_own" ON categories FOR SELECT USING (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "categories_insert_own" ON categories;
CREATE POLICY "categories_insert_own" ON categories FOR INSERT WITH CHECK (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "categories_update_own" ON categories;
CREATE POLICY "categories_update_own" ON categories FOR UPDATE USING (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "categories_delete_own" ON categories;
CREATE POLICY "categories_delete_own" ON categories FOR DELETE USING (
  tenant_id = auth.uid()
);

-- RLS Policies for topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "topics_select_own" ON topics;
-- Fixed RLS policy to use tenant_id = auth.uid()
CREATE POLICY "topics_select_own" ON topics FOR SELECT USING (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "topics_insert_own" ON topics;
CREATE POLICY "topics_insert_own" ON topics FOR INSERT WITH CHECK (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "topics_update_own" ON topics;
CREATE POLICY "topics_update_own" ON topics FOR UPDATE USING (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "topics_delete_own" ON topics;
CREATE POLICY "topics_delete_own" ON topics FOR DELETE USING (
  tenant_id = auth.uid()
);

-- RLS Policies for funding_goals
ALTER TABLE funding_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funding_goals_select_own" ON funding_goals;
-- Fixed RLS policy to use tenant_id = auth.uid()
CREATE POLICY "funding_goals_select_own" ON funding_goals FOR SELECT USING (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "funding_goals_insert_own" ON funding_goals;
CREATE POLICY "funding_goals_insert_own" ON funding_goals FOR INSERT WITH CHECK (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "funding_goals_update_own" ON funding_goals;
CREATE POLICY "funding_goals_update_own" ON funding_goals FOR UPDATE USING (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "funding_goals_delete_own" ON funding_goals;
CREATE POLICY "funding_goals_delete_own" ON funding_goals FOR DELETE USING (
  tenant_id = auth.uid()
);

-- Function to update funding goal progress
CREATE OR REPLACE FUNCTION update_funding_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all active funding goals for the tenant
  UPDATE funding_goals
  SET 
    current_amount = (
      SELECT COALESCE(SUM(amount), 0)
      FROM donations
      WHERE tenant_id = NEW.tenant_id
        AND status = 'succeeded'
        AND created_at >= funding_goals.created_at
    ),
    updated_at = NOW()
  WHERE tenant_id = NEW.tenant_id
    AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal progress on new donation
DROP TRIGGER IF EXISTS update_goal_on_donation ON donations;
CREATE TRIGGER update_goal_on_donation
  AFTER INSERT OR UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_funding_goal_progress();
