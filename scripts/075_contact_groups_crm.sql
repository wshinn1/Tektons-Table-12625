-- Contact Groups & CRM System for Super Admin
-- This creates a comprehensive contact management system

-- Contacts table (stores all contacts including tenants and lead magnets)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  source TEXT, -- 'tenant', 'learn_more', 'manual', 'import'
  tags TEXT[], -- Flexible tagging system
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Groups table
CREATE TABLE IF NOT EXISTS contact_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- System groups like 'All Tenants'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Group Members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS contact_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, group_id)
);

-- Email Workflows table
CREATE TABLE IF NOT EXISTS email_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'learn_more_signup', 'manual', 'group_join'
  trigger_group_id UUID REFERENCES contact_groups(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Steps table (defines the email sequence)
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES email_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 0, -- 0 for immediate, 12 for 12 hours, etc.
  email_subject TEXT NOT NULL,
  email_content TEXT NOT NULL, -- HTML content
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, step_number)
);

-- Workflow Enrollments (tracks who's in which workflow)
CREATE TABLE IF NOT EXISTS workflow_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES email_workflows(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  next_email_due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(workflow_id, contact_id)
);

-- Workflow Email Sends (tracking individual sends)
CREATE TABLE IF NOT EXISTS workflow_email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES workflow_enrollments(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'failed'
  error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_contact ON contact_group_members(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_group_members_group ON contact_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_contact ON workflow_enrollments(contact_id);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_status ON workflow_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_next_due ON workflow_enrollments(next_email_due_at);

-- RLS Policies (Super admins only)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage contacts" ON contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage contact_groups" ON contact_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage contact_group_members" ON contact_group_members FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage email_workflows" ON email_workflows FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage workflow_steps" ON workflow_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage workflow_enrollments" ON workflow_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage workflow_email_sends" ON workflow_email_sends FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

-- Insert default system groups
INSERT INTO contact_groups (name, description, is_system) VALUES
  ('All Tenants', 'All registered missionary tenants', TRUE),
  ('Learn More Signups', 'People who signed up to learn more about Tekt on''s Table', TRUE)
ON CONFLICT DO NOTHING;

-- Function to automatically add tenants to "All Tenants" group
CREATE OR REPLACE FUNCTION add_tenant_to_contact_group()
RETURNS TRIGGER AS $$
DECLARE
  tenant_contact_id UUID;
  all_tenants_group_id UUID;
BEGIN
  -- Get the "All Tenants" group ID
  SELECT id INTO all_tenants_group_id FROM contact_groups WHERE name = 'All Tenants' AND is_system = TRUE;
  
  -- Insert or update contact
  INSERT INTO contacts (first_name, last_name, email, source)
  VALUES (
    COALESCE(SPLIT_PART(NEW.full_name, ' ', 1), NEW.full_name),
    COALESCE(NULLIF(SUBSTRING(NEW.full_name FROM POSITION(' ' IN NEW.full_name) + 1), ''), ''),
    NEW.email,
    'tenant'
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW()
  RETURNING id INTO tenant_contact_id;
  
  -- Add to "All Tenants" group
  IF all_tenants_group_id IS NOT NULL AND tenant_contact_id IS NOT NULL THEN
    INSERT INTO contact_group_members (contact_id, group_id)
    VALUES (tenant_contact_id, all_tenants_group_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-add tenants to contact system
DROP TRIGGER IF EXISTS trg_add_tenant_to_contacts ON tenants;
CREATE TRIGGER trg_add_tenant_to_contacts
AFTER INSERT OR UPDATE OF full_name, email ON tenants
FOR EACH ROW
EXECUTE FUNCTION add_tenant_to_contact_group();

COMMENT ON TABLE contacts IS 'Comprehensive contact management for super admin CRM';
COMMENT ON TABLE contact_groups IS 'Contact groups for organizing and segmenting contacts';
COMMENT ON TABLE email_workflows IS 'Automated email drip campaigns and sequences';
COMMENT ON TABLE workflow_enrollments IS 'Tracks which contacts are enrolled in which workflows';
