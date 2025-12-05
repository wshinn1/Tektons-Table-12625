-- Add non-profit status fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS is_registered_nonprofit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nonprofit_ein TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_name TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_address TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_exemption_letter_url TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nonprofit_notes TEXT;

-- Add comment explaining the fields
COMMENT ON COLUMN tenants.is_registered_nonprofit IS 'Whether this tenant operates as or through a registered 501(c)(3) or equivalent non-profit organization';
COMMENT ON COLUMN tenants.nonprofit_ein IS 'Tax ID/EIN of the registered non-profit (if applicable)';
COMMENT ON COLUMN tenants.nonprofit_name IS 'Legal name of the registered non-profit organization';
COMMENT ON COLUMN tenants.nonprofit_address IS 'Official address of the non-profit organization';
COMMENT ON COLUMN tenants.nonprofit_exemption_letter_url IS 'URL to IRS determination letter or equivalent tax exemption documentation';
COMMENT ON COLUMN tenants.nonprofit_verified_at IS 'When the non-profit status was verified by platform admin';
COMMENT ON COLUMN tenants.nonprofit_notes IS 'Internal notes about non-profit verification';
