-- Phase 7: Additional Core Pages
-- Add about_content to tenants, create campaigns and contact submissions tables

-- Add about content and contact email to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS about_content JSONB,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS show_campaigns BOOLEAN DEFAULT false;

-- Create tenant campaigns table
CREATE TABLE IF NOT EXISTS tenant_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  featured_image_url TEXT,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant contact submissions table
CREATE TABLE IF NOT EXISTS tenant_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'read', 'archived')) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON tenant_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON tenant_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_tenant ON tenant_contact_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON tenant_contact_submissions(status);

-- Enable RLS
ALTER TABLE tenant_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns (public can view active campaigns)
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON tenant_campaigns;
CREATE POLICY "Anyone can view active campaigns" ON tenant_campaigns
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Tenant owners can manage their campaigns" ON tenant_campaigns;
CREATE POLICY "Tenant owners can manage their campaigns" ON tenant_campaigns
  FOR ALL USING (tenant_id = auth.uid());

-- RLS Policies for contact submissions (anyone can create, only tenant can view)
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON tenant_contact_submissions;
CREATE POLICY "Anyone can submit contact forms" ON tenant_contact_submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Tenant owners can view their contact submissions" ON tenant_contact_submissions;
CREATE POLICY "Tenant owners can view their contact submissions" ON tenant_contact_submissions
  FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Tenant owners can update their contact submissions" ON tenant_contact_submissions;
CREATE POLICY "Tenant owners can update their contact submissions" ON tenant_contact_submissions
  FOR UPDATE USING (tenant_id = auth.uid());
