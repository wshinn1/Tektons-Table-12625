-- Phase 8: Social Sharing & Polish
-- Create tables for social sharing tracking

-- Social shares tracking
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'email', 'copy_link'
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for social shares
CREATE INDEX IF NOT EXISTS idx_social_shares_tenant ON social_shares(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_post ON social_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);

-- Add share count to posts view
CREATE OR REPLACE VIEW post_share_counts AS
SELECT 
  post_id,
  platform,
  COUNT(*) as share_count
FROM social_shares
GROUP BY post_id, platform;

-- RLS Policies for social_shares
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_shares_insert_public" ON social_shares;
CREATE POLICY "social_shares_insert_public" ON social_shares
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "social_shares_select_own_tenant" ON social_shares;
CREATE POLICY "social_shares_select_own_tenant" ON social_shares
  FOR SELECT USING (tenant_id = auth.uid());

-- Add tenant settings fields
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS personal_reply_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email_signature TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS show_funding_goal_public BOOLEAN DEFAULT true;

-- Comment
COMMENT ON TABLE social_shares IS 'Tracks social media shares of posts';
