-- Fix RLS policies to use (select auth.uid()) instead of auth.uid()
-- This prevents re-evaluation for each row and improves performance
-- SAFE VERSION: Skips policies that reference columns that may not exist

-- =====================================================
-- support_tiers
-- =====================================================
DROP POLICY IF EXISTS "support_tiers_insert_own" ON support_tiers;
DROP POLICY IF EXISTS "support_tiers_update_own" ON support_tiers;
DROP POLICY IF EXISTS "support_tiers_delete_own" ON support_tiers;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tiers' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "support_tiers_insert_own" ON support_tiers FOR INSERT WITH CHECK (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "support_tiers_update_own" ON support_tiers FOR UPDATE USING (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "support_tiers_delete_own" ON support_tiers FOR DELETE USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- posts
-- =====================================================
DROP POLICY IF EXISTS "posts_select_own" ON posts;
DROP POLICY IF EXISTS "posts_insert_own" ON posts;
DROP POLICY IF EXISTS "posts_update_own" ON posts;
DROP POLICY IF EXISTS "posts_delete_own" ON posts;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "posts_select_own" ON posts FOR SELECT USING (tenant_id = (select auth.uid()) OR is_published = true)';
    EXECUTE 'CREATE POLICY "posts_insert_own" ON posts FOR INSERT WITH CHECK (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- supporters
-- =====================================================
DROP POLICY IF EXISTS "supporters_select_own_tenant" ON supporters;
DROP POLICY IF EXISTS "supporters_insert_own_tenant" ON supporters;
DROP POLICY IF EXISTS "supporters_update_own_tenant" ON supporters;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supporters' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "supporters_select_own_tenant" ON supporters FOR SELECT USING (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "supporters_insert_own_tenant" ON supporters FOR INSERT WITH CHECK (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "supporters_update_own_tenant" ON supporters FOR UPDATE USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- donations
-- =====================================================
DROP POLICY IF EXISTS "donations_select_own_tenant" ON donations;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donations' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "donations_select_own_tenant" ON donations FOR SELECT USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- funding_goals
-- =====================================================
DROP POLICY IF EXISTS "funding_goals_delete_own" ON funding_goals;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'funding_goals' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "funding_goals_delete_own" ON funding_goals FOR DELETE USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- supporter_profiles
-- =====================================================
DROP POLICY IF EXISTS "supporters_select_own" ON supporter_profiles;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supporter_profiles' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "supporters_select_own" ON supporter_profiles FOR SELECT USING (id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- post_topics
-- =====================================================
DROP POLICY IF EXISTS "Tenants can manage their post topics" ON post_topics;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_topics' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Tenants can manage their post topics" ON post_topics FOR ALL USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_topics.post_id AND posts.tenant_id = (select auth.uid())))';
  END IF;
END $$;

-- =====================================================
-- tenant_campaigns
-- =====================================================
DROP POLICY IF EXISTS "Tenant owners can manage their campaigns" ON tenant_campaigns;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_campaigns' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Tenant owners can manage their campaigns" ON tenant_campaigns FOR ALL USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- tenant_contact_submissions
-- =====================================================
DROP POLICY IF EXISTS "tenant_contact_submissions_select" ON tenant_contact_submissions;
DROP POLICY IF EXISTS "tenant_contact_submissions_update" ON tenant_contact_submissions;
DROP POLICY IF EXISTS "tenant_contact_submissions_delete" ON tenant_contact_submissions;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_contact_submissions' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "tenant_contact_submissions_select" ON tenant_contact_submissions FOR SELECT USING (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "tenant_contact_submissions_update" ON tenant_contact_submissions FOR UPDATE USING (tenant_id = (select auth.uid()))';
    EXECUTE 'CREATE POLICY "tenant_contact_submissions_delete" ON tenant_contact_submissions FOR DELETE USING (tenant_id = (select auth.uid()))';
  END IF;
END $$;

-- =====================================================
-- help_article_feedback (skip role-based policies)
-- =====================================================
DROP POLICY IF EXISTS "help_feedback_insert" ON help_article_feedback;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_article_feedback' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "help_feedback_insert" ON help_article_feedback FOR INSERT WITH CHECK (user_id = (select auth.uid()))';
  END IF;
END $$;

-- Note: Skipping help_articles and help_categories policies that reference 
-- tenants.role column which doesn't exist in production database
