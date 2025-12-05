-- Add homepage widget preference to tenant_giving_settings
ALTER TABLE tenant_giving_settings 
ADD COLUMN IF NOT EXISTS homepage_widget_preference TEXT DEFAULT 'giving' CHECK (homepage_widget_preference IN ('giving', 'campaign', 'none'));

-- Add comment to column
COMMENT ON COLUMN tenant_giving_settings.homepage_widget_preference IS 'Controls which widget to display on homepage: giving, campaign, or none';

-- Update existing rows to have the default value based on show_progress_widget
UPDATE tenant_giving_settings 
SET homepage_widget_preference = CASE 
  WHEN show_progress_widget = true THEN 'giving'
  ELSE 'none'
END
WHERE homepage_widget_preference IS NULL;
