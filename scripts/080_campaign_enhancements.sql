-- Phase 1: Campaign Feature Enhancements
-- Add new fields to tenant_campaigns for full campaign functionality

-- Add new columns to tenant_campaigns
ALTER TABLE tenant_campaigns 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS show_in_menu BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_donor_list BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recent_donations_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS suggested_amounts JSONB DEFAULT '[25, 50, 100, 250, 500]'::jsonb;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenant_campaigns_slug ON tenant_campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_campaigns_tenant_status ON tenant_campaigns(tenant_id, status);

-- Create function to increment campaign amount atomically
CREATE OR REPLACE FUNCTION increment_campaign_amount(
  p_campaign_id UUID,
  p_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE tenant_campaigns 
  SET 
    current_amount = COALESCE(current_amount, 0) + p_amount,
    updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_campaign_slug(p_title TEXT, p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
  v_final_slug TEXT;
BEGIN
  -- Convert title to slug format
  v_slug := lower(trim(regexp_replace(p_title, '[^a-zA-Z0-9\s-]', '', 'g')));
  v_slug := regexp_replace(v_slug, '\s+', '-', 'g');
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  
  -- Ensure slug is unique for this tenant
  v_final_slug := v_slug;
  WHILE EXISTS (
    SELECT 1 FROM tenant_campaigns 
    WHERE slug = v_final_slug AND tenant_id = p_tenant_id
  ) LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_slug || '-' || v_counter;
  END LOOP;
  
  RETURN v_final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing campaigns to have slugs if they don't
DO $$
DECLARE
  campaign RECORD;
  new_slug TEXT;
BEGIN
  FOR campaign IN 
    SELECT id, title, tenant_id 
    FROM tenant_campaigns 
    WHERE slug IS NULL
  LOOP
    new_slug := generate_campaign_slug(campaign.title, campaign.tenant_id);
    UPDATE tenant_campaigns 
    SET slug = new_slug 
    WHERE id = campaign.id;
  END LOOP;
END $$;

-- Make slug NOT NULL after populating existing records
ALTER TABLE tenant_campaigns 
ALTER COLUMN slug SET NOT NULL;

-- Add comment for documentation
COMMENT ON FUNCTION increment_campaign_amount IS 'Atomically increments campaign current_amount when donations are received';
COMMENT ON FUNCTION generate_campaign_slug IS 'Generates a unique URL-friendly slug from campaign title';
