-- Phase 5: Campaign Email Notifications
-- Add notification preferences for tenants

-- Add notification preference column to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS campaign_notification_preference TEXT DEFAULT 'immediate' CHECK (campaign_notification_preference IN ('immediate', 'daily', 'off'));

-- Create table to track daily notification digest
CREATE TABLE IF NOT EXISTS campaign_donation_digest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  donation_count INTEGER DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  UNIQUE(tenant_id, notification_date)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_campaign_donation_digest_tenant_date 
ON campaign_donation_digest(tenant_id, notification_date);

CREATE INDEX IF NOT EXISTS idx_campaign_donation_digest_pending 
ON campaign_donation_digest(notification_date, sent_at) 
WHERE sent_at IS NULL;

-- Add comment for documentation
COMMENT ON TABLE campaign_donation_digest IS 'Tracks daily donation digests for campaign notifications sent at noon EST';
COMMENT ON COLUMN tenants.campaign_notification_preference IS 'How tenant wants to receive campaign donation notifications: immediate, daily (noon EST), or off';
