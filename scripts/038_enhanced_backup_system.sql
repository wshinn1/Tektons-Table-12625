-- Enhance backups table for tenant-specific backups
ALTER TABLE backups ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE backups ADD COLUMN IF NOT EXISTS backup_category TEXT DEFAULT 'platform'; -- 'platform' or 'tenant'

-- Add email notification tracking
ALTER TABLE backups ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
ALTER TABLE backups ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;

-- Add retention policy
ALTER TABLE backups ADD COLUMN IF NOT EXISTS retention_days INTEGER DEFAULT 30;
ALTER TABLE backups ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Create index for tenant backups
CREATE INDEX IF NOT EXISTS idx_backups_tenant_id ON backups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_backups_category ON backups(backup_category);
CREATE INDEX IF NOT EXISTS idx_backups_expires_at ON backups(expires_at);

-- View for backup statistics
CREATE OR REPLACE VIEW backup_stats AS
SELECT 
  backup_category,
  COUNT(*) as total_backups,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_backups,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_backups,
  SUM(file_size_bytes) as total_size_bytes,
  MAX(completed_at) as last_backup_at
FROM backups
GROUP BY backup_category;
