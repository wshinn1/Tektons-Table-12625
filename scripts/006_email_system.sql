-- Phase 6: Email System
-- Post notification emails and email preferences

-- Email sent tracking
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  supporter_id UUID REFERENCES supporter_profiles(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL, -- 'post_notification', 'newsletter', 'welcome', etc.
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add email preferences to supporter_profiles
ALTER TABLE supporter_profiles
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- RLS Policies for email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_logs_tenant_access" ON email_logs;
CREATE POLICY "email_logs_tenant_access" ON email_logs
  FOR ALL USING (tenant_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_tenant ON email_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_post ON email_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_supporter_email_prefs ON supporter_profiles(email_notifications);
