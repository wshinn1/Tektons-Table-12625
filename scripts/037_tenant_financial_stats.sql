-- Add financial tracking columns to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS total_donations DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS total_platform_fees DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS last_donation_at TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS backup_enabled BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create view for tenant financial stats
CREATE OR REPLACE VIEW tenant_financial_stats AS
SELECT 
  t.id as tenant_id,
  t.full_name,
  t.email,
  t.subdomain,
  t.is_active,
  t.onboarding_completed,
  t.created_at,
  t.mission_organization,
  t.location,
  t.platform_fee_percentage,
  COALESCE(SUM(d.amount), 0) as total_donations,
  COALESCE(SUM(d.platform_fee), 0) as total_platform_fees,
  COALESCE(SUM(d.tip_amount), 0) as total_tips,
  MAX(d.created_at) as last_donation_at,
  COUNT(d.id) as donation_count,
  COUNT(DISTINCT d.supporter_id) as unique_supporters
FROM tenants t
LEFT JOIN donations d ON t.id = d.tenant_id AND d.status = 'succeeded'
GROUP BY t.id, t.full_name, t.email, t.subdomain, t.is_active, t.onboarding_completed, 
         t.created_at, t.mission_organization, t.location, t.platform_fee_percentage;

-- Grant access to super admins
GRANT SELECT ON tenant_financial_stats TO authenticated;
