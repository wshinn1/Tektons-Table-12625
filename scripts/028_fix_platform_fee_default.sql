-- Fix platform fee to be 3.5% for all tenants
-- This ensures the platform fee matches the configured base rate

-- Update the base platform fee in settings if it's not already 3.5%
UPDATE platform_settings
SET setting_value = '3.5'::jsonb
WHERE setting_key = 'base_platform_fee_percentage'
AND setting_value::text::numeric != 3.5;

-- Update tenant_pricing records to use 3.5% as the current rate
-- for tenants who don't have a welcome discount or referral discount
UPDATE tenant_pricing
SET current_rate_percentage = 3.5
WHERE current_rate_percentage = 5.0
OR current_rate_percentage > 3.5;

-- Update old tenant records that may have 5% or 2.5% default
UPDATE tenants
SET platform_fee_percentage = 3.5
WHERE platform_fee_percentage IS NOT NULL
AND platform_fee_percentage != 3.5;

-- Add a comment explaining the platform fee
COMMENT ON COLUMN tenants.platform_fee_percentage IS 'Legacy field - use tenant_pricing.current_rate_percentage for actual fee';
