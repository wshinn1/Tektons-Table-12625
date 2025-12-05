-- Phase 5: Email Newsletter System
-- Create tables for tenant email subscribers and newsletters

-- Email subscribers table
CREATE TABLE IF NOT EXISTS tenant_email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL CHECK (status IN ('subscribed', 'unsubscribed')) DEFAULT 'subscribed',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- Newsletters table
CREATE TABLE IF NOT EXISTS tenant_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent')) DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email opens tracking
CREATE TABLE IF NOT EXISTS tenant_newsletter_opens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID NOT NULL REFERENCES tenant_newsletters(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES tenant_email_subscribers(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(newsletter_id, subscriber_id)
);

-- Email clicks tracking
CREATE TABLE IF NOT EXISTS tenant_newsletter_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID NOT NULL REFERENCES tenant_newsletters(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES tenant_email_subscribers(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Added IF NOT EXISTS to all index creation to prevent duplicate errors
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_subscribers_tenant ON tenant_email_subscribers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON tenant_email_subscribers(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_newsletters_tenant ON tenant_newsletters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON tenant_newsletters(tenant_id, status);

-- Enable RLS
ALTER TABLE tenant_email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_newsletter_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_newsletter_clicks ENABLE ROW LEVEL SECURITY;

-- Added DROP POLICY IF EXISTS to prevent duplicate policy errors
-- RLS Policies for subscribers
DROP POLICY IF EXISTS "Tenants can manage their subscribers" ON tenant_email_subscribers;
CREATE POLICY "Tenants can manage their subscribers"
  ON tenant_email_subscribers
  FOR ALL
  USING (tenant_id = auth.uid());

-- RLS Policies for newsletters
DROP POLICY IF EXISTS "Tenants can manage their newsletters" ON tenant_newsletters;
CREATE POLICY "Tenants can manage their newsletters"
  ON tenant_newsletters
  FOR ALL
  USING (tenant_id = auth.uid());

-- RLS Policies for tracking
DROP POLICY IF EXISTS "Tenants can view their newsletter stats" ON tenant_newsletter_opens;
CREATE POLICY "Tenants can view their newsletter stats"
  ON tenant_newsletter_opens
  FOR SELECT
  USING (
    newsletter_id IN (
      SELECT id FROM tenant_newsletters WHERE tenant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tenants can view their click stats" ON tenant_newsletter_clicks;
CREATE POLICY "Tenants can view their click stats"
  ON tenant_newsletter_clicks
  FOR SELECT
  USING (
    newsletter_id IN (
      SELECT id FROM tenant_newsletters WHERE tenant_id = auth.uid()
    )
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Added DROP TRIGGER IF EXISTS to prevent duplicate trigger errors
-- Add triggers
DROP TRIGGER IF EXISTS update_tenant_email_subscribers_updated_at ON tenant_email_subscribers;
CREATE TRIGGER update_tenant_email_subscribers_updated_at
  BEFORE UPDATE ON tenant_email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_newsletters_updated_at ON tenant_newsletters;
CREATE TRIGGER update_tenant_newsletters_updated_at
  BEFORE UPDATE ON tenant_newsletters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
