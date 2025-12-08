-- Premium Resources Phase 1: Database Schema & RLS Policies
-- Run this script to create all necessary tables for the premium resources feature

-- ============================================
-- 1. Resource Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_resource_categories_slug ON resource_categories(slug);
CREATE INDEX IF NOT EXISTS idx_resource_categories_sort ON resource_categories(sort_order);

-- ============================================
-- 2. Platform Resources Table (Blog Posts)
-- ============================================
CREATE TABLE IF NOT EXISTS platform_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL, -- TipTap JSON content
  featured_image VARCHAR(500),
  author_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  is_premium BOOLEAN DEFAULT false,
  read_time_minutes INTEGER,
  word_count INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for platform_resources
CREATE INDEX IF NOT EXISTS idx_platform_resources_slug ON platform_resources(slug);
CREATE INDEX IF NOT EXISTS idx_platform_resources_status ON platform_resources(status);
CREATE INDEX IF NOT EXISTS idx_platform_resources_is_premium ON platform_resources(is_premium);
CREATE INDEX IF NOT EXISTS idx_platform_resources_published_at ON platform_resources(published_at DESC);

-- ============================================
-- 3. Resource to Category Mapping (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS resource_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES platform_resources(id) ON DELETE CASCADE,
  category_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, category_id)
);

-- Indexes for faster joins
CREATE INDEX IF NOT EXISTS idx_resource_category_resource ON resource_category_assignments(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_category_category ON resource_category_assignments(category_id);

-- ============================================
-- 4. Premium Subscriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL, -- active, trialing, past_due, canceled, comped
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ, -- 7 days after payment failure
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for premium_subscriptions
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_email ON premium_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_stripe_sub ON premium_subscriptions(stripe_subscription_id);

-- ============================================
-- 5. Comped/Free Access Grants Table
-- ============================================
CREATE TABLE IF NOT EXISTS comped_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT,
  duration_type VARCHAR(20) NOT NULL, -- '1_month', '3_months', '6_months', '1_year', 'lifetime'
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = lifetime access
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for comped_access
CREATE INDEX IF NOT EXISTS idx_comped_access_user ON comped_access(user_id);
CREATE INDEX IF NOT EXISTS idx_comped_access_email ON comped_access(email);
CREATE INDEX IF NOT EXISTS idx_comped_access_active ON comped_access(is_active);
CREATE INDEX IF NOT EXISTS idx_comped_access_expires ON comped_access(expires_at);

-- ============================================
-- 6. Add Premium Trial Columns to Tenants
-- ============================================
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS premium_trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS premium_trial_used BOOLEAN DEFAULT false;

-- ============================================
-- 7. Resource Read Progress (Optional - for future)
-- ============================================
CREATE TABLE IF NOT EXISTS resource_read_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES platform_resources(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Index for read progress
CREATE INDEX IF NOT EXISTS idx_resource_read_progress_user ON resource_read_progress(user_id);

-- ============================================
-- 8. Enable Row Level Security
-- ============================================
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comped_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_read_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLS Policies - Resource Categories
-- ============================================
-- Anyone can view categories
CREATE POLICY "Anyone can view resource categories"
ON resource_categories FOR SELECT
USING (true);

-- Super admins can manage categories
CREATE POLICY "Super admins can manage resource categories"
ON resource_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 10. RLS Policies - Platform Resources
-- ============================================
-- Public can view published free resources
CREATE POLICY "Public can view published free resources"
ON platform_resources FOR SELECT
USING (
  status = 'published' AND is_premium = false
);

-- Subscribers can view published premium resources
CREATE POLICY "Subscribers can view published premium resources"
ON platform_resources FOR SELECT
USING (
  status = 'published' 
  AND is_premium = true 
  AND (
    -- Has active subscription
    EXISTS (
      SELECT 1 FROM premium_subscriptions 
      WHERE (user_id = auth.uid() OR email = auth.jwt()->>'email')
      AND status IN ('active', 'trialing')
      AND (current_period_end > NOW() OR status = 'trialing')
    )
    OR
    -- Has active comped access
    EXISTS (
      SELECT 1 FROM comped_access 
      WHERE (user_id = auth.uid() OR email = auth.jwt()->>'email')
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > NOW())
    )
    OR
    -- Tenant with active trial
    EXISTS (
      SELECT 1 FROM tenants 
      WHERE id = auth.uid() 
      AND premium_trial_ends_at > NOW()
    )
  )
);

-- Super admins can manage all resources
CREATE POLICY "Super admins can manage platform resources"
ON platform_resources FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 11. RLS Policies - Resource Category Assignments
-- ============================================
-- Anyone can view category assignments
CREATE POLICY "Anyone can view resource category assignments"
ON resource_category_assignments FOR SELECT
USING (true);

-- Super admins can manage assignments
CREATE POLICY "Super admins can manage resource category assignments"
ON resource_category_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 12. RLS Policies - Premium Subscriptions
-- ============================================
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON premium_subscriptions FOR SELECT
USING (
  user_id = auth.uid() OR email = auth.jwt()->>'email'
);

-- Super admins can view all subscriptions
CREATE POLICY "Super admins can view all subscriptions"
ON premium_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  )
);

-- Service role/webhooks can manage subscriptions
CREATE POLICY "Service role can manage subscriptions"
ON premium_subscriptions FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- 13. RLS Policies - Comped Access
-- ============================================
-- Users can view their own comped access
CREATE POLICY "Users can view own comped access"
ON comped_access FOR SELECT
USING (
  user_id = auth.uid() OR email = auth.jwt()->>'email'
);

-- Super admins can manage all comped access
CREATE POLICY "Super admins can manage comped access"
ON comped_access FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 14. RLS Policies - Read Progress
-- ============================================
-- Users can manage their own read progress
CREATE POLICY "Users can manage own read progress"
ON resource_read_progress FOR ALL
USING (user_id = auth.uid());

-- ============================================
-- 15. Helper Functions
-- ============================================

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION has_premium_access(check_user_id UUID DEFAULT NULL, check_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_access BOOLEAN := false;
  user_email TEXT;
BEGIN
  -- Get user email if not provided
  IF check_email IS NULL AND check_user_id IS NOT NULL THEN
    SELECT email INTO user_email FROM auth.users WHERE id = check_user_id;
    check_email := user_email;
  END IF;

  -- Check for active subscription
  SELECT EXISTS (
    SELECT 1 FROM premium_subscriptions 
    WHERE (user_id = check_user_id OR email = check_email)
    AND status IN ('active', 'trialing')
    AND (current_period_end > NOW() OR status = 'trialing')
  ) INTO has_access;
  
  IF has_access THEN RETURN true; END IF;

  -- Check for comped access
  SELECT EXISTS (
    SELECT 1 FROM comped_access 
    WHERE (user_id = check_user_id OR email = check_email)
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_access;
  
  IF has_access THEN RETURN true; END IF;

  -- Check for tenant trial
  SELECT EXISTS (
    SELECT 1 FROM tenants 
    WHERE id = check_user_id 
    AND premium_trial_ends_at > NOW()
  ) INTO has_access;

  RETURN has_access;
END;
$$;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 16. Triggers for updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_resource_categories_updated_at ON resource_categories;
CREATE TRIGGER update_resource_categories_updated_at
  BEFORE UPDATE ON resource_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_resources_updated_at ON platform_resources;
CREATE TRIGGER update_platform_resources_updated_at
  BEFORE UPDATE ON platform_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_subscriptions_updated_at ON premium_subscriptions;
CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON premium_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 17. Insert Default Free Resources Category
-- ============================================
INSERT INTO resource_categories (name, slug, description, icon, is_premium, sort_order)
VALUES ('Free Resources', 'free-resources', 'Free content available to everyone', 'Gift', false, 0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Done! Phase 1 complete.
-- ============================================
