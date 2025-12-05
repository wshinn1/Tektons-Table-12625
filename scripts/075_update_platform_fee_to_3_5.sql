-- Update all tenant platform fees to 3.5% for live mode
-- This resets any test fees to the correct production fee

UPDATE tenants
SET platform_fee_percentage = 3.5
WHERE platform_fee_percentage IS NULL OR platform_fee_percentage != 3.5;
