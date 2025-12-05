-- Financial Campaigns System
-- Phase 13: Allow tenants to create fundraising campaigns for specific causes

-- Drop existing objects if they exist
DROP TABLE IF EXISTS campaign_donations CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- Campaigns table
CREATE TABLE campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  title text not null,
  description text,
  goal_amount decimal(10,2) not null,
  current_amount decimal(10,2) default 0,
  currency text default 'USD',
  category text not null check (category in ('mission_trip', 'equipment', 'emergency', 'project', 'other')),
  image_url text,
  start_date timestamp default now(),
  end_date timestamp,
  status text default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  is_featured boolean default false,
  slug text unique not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Campaign donations junction table
CREATE TABLE campaign_donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade not null,
  donation_id uuid references donations(id) on delete cascade not null,
  amount decimal(10,2) not null,
  created_at timestamp default now(),
  unique(campaign_id, donation_id)
);

-- Indexes
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaign_donations_campaign ON campaign_donations(campaign_id);
CREATE INDEX idx_campaign_donations_donation ON campaign_donations(donation_id);

-- RLS Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_donations ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY campaigns_select ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY campaigns_insert ON campaigns FOR INSERT TO authenticated WITH CHECK (tenant_id = auth.uid());
CREATE POLICY campaigns_update ON campaigns FOR UPDATE TO authenticated USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());
CREATE POLICY campaigns_delete ON campaigns FOR DELETE TO authenticated USING (tenant_id = auth.uid());

-- Campaign donations policies  
CREATE POLICY campaign_donations_select ON campaign_donations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_donations.campaign_id AND campaigns.tenant_id = auth.uid())
);
CREATE POLICY campaign_donations_insert ON campaign_donations FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_donations.campaign_id AND campaigns.tenant_id = auth.uid())
);

-- Trigger to update campaign current_amount
CREATE OR REPLACE FUNCTION update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM campaign_donations
    WHERE campaign_id = NEW.campaign_id
  ),
  updated_at = now()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_donation_update
AFTER INSERT ON campaign_donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_amount();

-- Auto-complete campaigns when goal is reached
CREATE OR REPLACE FUNCTION check_campaign_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_amount >= NEW.goal_amount AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_completion_check
BEFORE UPDATE ON campaigns
FOR EACH ROW
WHEN (OLD.current_amount IS DISTINCT FROM NEW.current_amount)
EXECUTE FUNCTION check_campaign_completion();
