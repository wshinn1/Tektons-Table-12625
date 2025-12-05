-- Phase 7: Standalone Newsletter System
-- Creates tables for newsletters, scheduling, and analytics

-- Drop existing objects if they exist
DROP TABLE IF EXISTS newsletter_analytics CASCADE;
DROP TABLE IF EXISTS newsletter_recipients CASCADE;
DROP TABLE IF EXISTS newsletters CASCADE;
DROP TYPE IF EXISTS newsletter_status CASCADE;
DROP TYPE IF EXISTS recipient_segment CASCADE;

-- Newsletter status enum
CREATE TYPE newsletter_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');

-- Recipient segment types
CREATE TYPE recipient_segment AS ENUM ('all', 'monthly_donors', 'new_supporters', 'one_time_donors', 'custom');

-- Newsletters table
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject VARCHAR(500) NOT NULL,
  content JSONB NOT NULL, -- BlockNote JSON content
  language VARCHAR(10) DEFAULT 'en',
  status newsletter_status DEFAULT 'draft',
  segment recipient_segment DEFAULT 'all',
  custom_segment_ids UUID[], -- Array of supporter IDs for custom segment
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter recipients tracking
CREATE TABLE newsletter_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL REFERENCES supporter_profiles(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMPTZ,
  resend_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, bounced
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter analytics (from Resend webhooks)
CREATE TABLE newsletter_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES newsletter_recipients(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- opened, clicked, bounced, complained
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_newsletters_tenant ON newsletters(tenant_id);
CREATE INDEX idx_newsletters_status ON newsletters(status);
CREATE INDEX idx_newsletters_scheduled ON newsletters(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_newsletter_recipients_newsletter ON newsletter_recipients(newsletter_id);
CREATE INDEX idx_newsletter_recipients_supporter ON newsletter_recipients(supporter_id);
CREATE INDEX idx_newsletter_analytics_newsletter ON newsletter_analytics(newsletter_id);

-- RLS Policies
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY;

-- Newsletters policies
DROP POLICY IF EXISTS newsletters_tenant_all ON newsletters;
CREATE POLICY newsletters_tenant_all ON newsletters
  FOR ALL USING (tenant_id = auth.uid());

-- Newsletter recipients policies (tenant can view their newsletter recipients)
DROP POLICY IF EXISTS newsletter_recipients_select ON newsletter_recipients;
CREATE POLICY newsletter_recipients_select ON newsletter_recipients
  FOR SELECT USING (
    newsletter_id IN (SELECT id FROM newsletters WHERE tenant_id = auth.uid())
  );

-- Newsletter analytics policies (tenant can view their analytics)
DROP POLICY IF EXISTS newsletter_analytics_select ON newsletter_analytics;
CREATE POLICY newsletter_analytics_select ON newsletter_analytics
  FOR SELECT USING (
    newsletter_id IN (SELECT id FROM newsletters WHERE tenant_id = auth.uid())
  );

-- Function to update newsletter updated_at
CREATE OR REPLACE FUNCTION update_newsletter_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_newsletter_timestamp_trigger ON newsletters;
CREATE TRIGGER update_newsletter_timestamp_trigger
  BEFORE UPDATE ON newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_timestamp();
