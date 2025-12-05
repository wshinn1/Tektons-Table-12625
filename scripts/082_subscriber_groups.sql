-- Subscriber Groups System
-- Allows tenants to create custom groups and assign subscribers to them

-- Create subscriber_groups table
CREATE TABLE IF NOT EXISTS subscriber_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- Create subscriber_group_members junction table
CREATE TABLE IF NOT EXISTS subscriber_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES subscriber_groups(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES tenant_email_subscribers(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, subscriber_id)
);

-- Add target_groups column to newsletters
ALTER TABLE tenant_newsletters 
ADD COLUMN IF NOT EXISTS target_groups TEXT[] DEFAULT ARRAY['all'];

-- Add target_groups column to blog_posts for post notifications
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS notify_groups TEXT[] DEFAULT ARRAY['all'];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriber_groups_tenant_id ON subscriber_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_group_members_group_id ON subscriber_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_group_members_subscriber_id ON subscriber_group_members(subscriber_id);

-- Add group_id column to tenant_email_subscribers for primary group assignment
ALTER TABLE tenant_email_subscribers
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES subscriber_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenant_email_subscribers_group_id ON tenant_email_subscribers(group_id);

-- Enable RLS
ALTER TABLE subscriber_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Tenants can view their groups" ON subscriber_groups;
DROP POLICY IF EXISTS "Tenants can create groups" ON subscriber_groups;
DROP POLICY IF EXISTS "Tenants can update their groups" ON subscriber_groups;
DROP POLICY IF EXISTS "Tenants can delete their groups" ON subscriber_groups;

-- Fix RLS policies: tenants.id = auth.uid() (no user_id column)
-- RLS policies for subscriber_groups
CREATE POLICY "Tenants can view their groups" ON subscriber_groups
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can create groups" ON subscriber_groups
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can update their groups" ON subscriber_groups
  FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can delete their groups" ON subscriber_groups
  FOR DELETE USING (tenant_id = auth.uid());

-- Drop existing policies first
DROP POLICY IF EXISTS "Tenants can view group members" ON subscriber_group_members;
DROP POLICY IF EXISTS "Tenants can add group members" ON subscriber_group_members;
DROP POLICY IF EXISTS "Tenants can remove group members" ON subscriber_group_members;

-- Fix RLS policies for group members
CREATE POLICY "Tenants can view group members" ON subscriber_group_members
  FOR SELECT USING (group_id IN (
    SELECT id FROM subscriber_groups WHERE tenant_id = auth.uid()
  ));

CREATE POLICY "Tenants can add group members" ON subscriber_group_members
  FOR INSERT WITH CHECK (group_id IN (
    SELECT id FROM subscriber_groups WHERE tenant_id = auth.uid()
  ));

CREATE POLICY "Tenants can remove group members" ON subscriber_group_members
  FOR DELETE USING (group_id IN (
    SELECT id FROM subscriber_groups WHERE tenant_id = auth.uid()
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriber_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_subscriber_groups_updated_at_trigger ON subscriber_groups;
CREATE TRIGGER update_subscriber_groups_updated_at_trigger
  BEFORE UPDATE ON subscriber_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriber_groups_updated_at();
