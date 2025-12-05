-- Add fee model selection to tenant giving settings
-- Allows tenants to choose between donor tips or platform fees

ALTER TABLE tenant_giving_settings 
ADD COLUMN IF NOT EXISTS fee_model TEXT DEFAULT 'donor_tips' CHECK (fee_model IN ('donor_tips', 'platform_fee'));

ALTER TABLE tenant_giving_settings
ADD COLUMN IF NOT EXISTS suggested_tip_percent DECIMAL(5,2) DEFAULT 12.00;

COMMENT ON COLUMN tenant_giving_settings.fee_model IS 'donor_tips = show optional tip to donors (0% platform fee), platform_fee = apply platform fee (no tips shown)';
COMMENT ON COLUMN tenant_giving_settings.suggested_tip_percent IS 'Default suggested tip percentage when fee_model is donor_tips';

-- Update existing tenants to use donor_tips model by default
UPDATE tenant_giving_settings 
SET fee_model = 'donor_tips', suggested_tip_percent = 12.00
WHERE fee_model IS NULL;
