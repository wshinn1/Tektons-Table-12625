-- Phase 3: Financial Tracking Views and Functions
-- Creates aggregated views for platform financial analytics

-- Create view for platform-wide financial metrics
CREATE OR REPLACE VIEW admin_financials AS
SELECT 
  COUNT(DISTINCT tenant_id) as total_tenants,
  COUNT(DISTINCT CASE WHEN status = 'succeeded' THEN tenant_id END) as active_tenants,
  SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as total_donations,
  SUM(CASE WHEN status = 'succeeded' THEN platform_fee ELSE 0 END) as total_platform_fees,
  SUM(CASE WHEN status = 'succeeded' THEN tip_amount ELSE 0 END) as total_tips,
  SUM(CASE WHEN status = 'succeeded' AND supporter_covered_stripe_fee THEN stripe_fee ELSE 0 END) as fee_coverage_collected,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_donations_count,
  AVG(CASE WHEN status = 'succeeded' THEN amount END) as average_donation
FROM donations;

-- Create function to get financial metrics by date range
CREATE OR REPLACE FUNCTION get_financial_metrics(
  start_date TIMESTAMP,
  end_date TIMESTAMP
)
RETURNS TABLE (
  total_donations NUMERIC,
  platform_fees NUMERIC,
  tips_collected NUMERIC,
  fee_coverage NUMERIC,
  donation_count BIGINT,
  unique_tenants BIGINT,
  unique_supporters BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount ELSE 0 END), 0) as total_donations,
    COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.platform_fee ELSE 0 END), 0) as platform_fees,
    COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.tip_amount ELSE 0 END), 0) as tips_collected,
    COALESCE(SUM(CASE WHEN d.status = 'succeeded' AND d.supporter_covered_stripe_fee THEN d.stripe_fee ELSE 0 END), 0) as fee_coverage,
    COUNT(CASE WHEN d.status = 'succeeded' THEN 1 END) as donation_count,
    COUNT(DISTINCT d.tenant_id) as unique_tenants,
    COUNT(DISTINCT d.supporter_id) as unique_supporters
  FROM donations d
  WHERE d.created_at >= start_date 
    AND d.created_at <= end_date;
END;
$$ LANGUAGE plpgsql;

-- Create view for tenant financial summaries
CREATE OR REPLACE VIEW tenant_financials AS
SELECT 
  t.id as tenant_id,
  t.full_name,
  t.email,
  t.subdomain,
  COUNT(CASE WHEN d.status = 'succeeded' THEN 1 END) as total_donations_count,
  COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.amount ELSE 0 END), 0) as total_donations_amount,
  COALESCE(SUM(CASE WHEN d.status = 'succeeded' THEN d.platform_fee ELSE 0 END), 0) as total_platform_fees_paid,
  MAX(d.created_at) as last_donation_at,
  t.stripe_charges_enabled as is_active
FROM tenants t
LEFT JOIN donations d ON t.id = d.tenant_id
GROUP BY t.id, t.full_name, t.email, t.subdomain, t.stripe_charges_enabled;

-- Grant access to super admins
GRANT SELECT ON admin_financials TO authenticated;
GRANT SELECT ON tenant_financials TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_metrics TO authenticated;
