-- Add notification settings for tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "donation_notifications": true,
  "new_supporter_notifications": true,
  "monthly_summary": true,
  "failed_payment_alerts": true
}'::jsonb;

-- Add column for custom notification email (if different from primary email)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS notification_email TEXT;

COMMENT ON COLUMN tenants.notification_settings IS 'Email notification preferences for tenant';
COMMENT ON COLUMN tenants.notification_email IS 'Alternative email for receiving notifications (defaults to primary email)';
