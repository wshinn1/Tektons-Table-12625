-- Newsletter system for both tenants and super admin

-- Super Admin Newsletters (platform-wide communications)
CREATE TABLE IF NOT EXISTS admin_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  preview_text TEXT,
  content TEXT NOT NULL, -- MJML/HTML content from Easy Email
  design_json JSONB, -- Save Easy Email design JSON for editing
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent'
  target_groups UUID[], -- Array of contact_group IDs
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Stats
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0
);

-- Admin Newsletter Recipients (tracking)
CREATE TABLE IF NOT EXISTS admin_newsletter_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES admin_newsletters(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  resend_message_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'failed'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE(newsletter_id, contact_id)
);

-- Newsletter Analytics Events
CREATE TABLE IF NOT EXISTS admin_newsletter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES admin_newsletters(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES admin_newsletter_recipients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'
  event_data JSONB, -- Additional data like clicked URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_newsletters_status ON admin_newsletters(status);
CREATE INDEX IF NOT EXISTS idx_admin_newsletters_scheduled ON admin_newsletters(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_admin_newsletter_recipients_newsletter ON admin_newsletter_recipients(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_admin_newsletter_recipients_status ON admin_newsletter_recipients(status);
CREATE INDEX IF NOT EXISTS idx_admin_newsletter_events_newsletter ON admin_newsletter_events(newsletter_id);

-- RLS
ALTER TABLE admin_newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_newsletter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage admin_newsletters" ON admin_newsletters FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage admin_newsletter_recipients" ON admin_newsletter_recipients FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage admin_newsletter_events" ON admin_newsletter_events FOR ALL USING (
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
);

COMMENT ON TABLE admin_newsletters IS 'Platform-wide newsletters sent by super admins to contact groups';
COMMENT ON TABLE admin_newsletter_recipients IS 'Tracks delivery status for each recipient of admin newsletters';
