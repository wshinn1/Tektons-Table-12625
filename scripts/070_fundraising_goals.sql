-- Add fundraising goal configuration to tenant giving settings
-- Allows tenants to set starting amount and target goal

ALTER TABLE tenant_giving_settings 
ADD COLUMN IF NOT EXISTS fundraising_start_amount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE tenant_giving_settings
ADD COLUMN IF NOT EXISTS fundraising_target_goal DECIMAL(10,2) DEFAULT 5000.00;

ALTER TABLE tenant_giving_settings
ADD COLUMN IF NOT EXISTS show_donor_names BOOLEAN DEFAULT false;

ALTER TABLE tenant_giving_settings
ADD COLUMN IF NOT EXISTS show_progress_widget BOOLEAN DEFAULT true;

COMMENT ON COLUMN tenant_giving_settings.fundraising_start_amount IS 'Starting amount already raised (manually set by tenant)';
COMMENT ON COLUMN tenant_giving_settings.fundraising_target_goal IS 'Target fundraising goal amount';
COMMENT ON COLUMN tenant_giving_settings.show_donor_names IS 'Whether to show recent donor names in the widget (default hidden for privacy)';
COMMENT ON COLUMN tenant_giving_settings.show_progress_widget IS 'Whether to display the giving widget on home/blog pages';

-- Update existing tenants with default values
UPDATE tenant_giving_settings 
SET 
  fundraising_start_amount = 0.00,
  fundraising_target_goal = 5000.00,
  show_donor_names = false,
  show_progress_widget = true
WHERE fundraising_start_amount IS NULL 
   OR fundraising_target_goal IS NULL 
   OR show_donor_names IS NULL
   OR show_progress_widget IS NULL;
