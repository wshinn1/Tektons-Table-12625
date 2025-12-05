-- Phase 4: Content Restriction & Follower System
-- Creates follower management with manual approval workflow

-- Create tenant_followers table
CREATE TABLE IF NOT EXISTS tenant_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Add followers_only column to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS followers_only BOOLEAN DEFAULT false;

-- Create index for faster follower lookups
CREATE INDEX IF NOT EXISTS idx_tenant_followers_tenant_id ON tenant_followers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_followers_user_id ON tenant_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_followers_status ON tenant_followers(status);

-- Enable RLS
ALTER TABLE tenant_followers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can request to follow (insert)
CREATE POLICY "Anyone can request to follow" ON tenant_followers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own follow requests
CREATE POLICY "Users can view their own follow requests" ON tenant_followers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Tenants can view all their followers
CREATE POLICY "Tenants can view their followers" ON tenant_followers
  FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

-- Policy: Tenants can update follower status (approve/reject)
CREATE POLICY "Tenants can update follower status" ON tenant_followers
  FOR UPDATE
  USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenant_followers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Set approved_at when status changes to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = NOW();
  END IF;
  
  -- Set rejected_at when status changes to rejected
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    NEW.rejected_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_tenant_followers_updated_at_trigger ON tenant_followers;
CREATE TRIGGER update_tenant_followers_updated_at_trigger
  BEFORE UPDATE ON tenant_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_followers_updated_at();

-- Create function to check if user is following tenant
CREATE OR REPLACE FUNCTION is_user_following_tenant(p_tenant_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_followers
    WHERE tenant_id = p_tenant_id
    AND user_id = p_user_id
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
