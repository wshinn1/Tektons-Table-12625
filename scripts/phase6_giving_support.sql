-- Phase 6: Giving/Support Pages Database Schema
-- Creates tables for financial supporters, donations, and giving pages

-- Financial supporters table
CREATE TABLE IF NOT EXISTS tenant_financial_supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_customer_id TEXT UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  total_given DECIMAL(10,2) DEFAULT 0,
  monthly_amount DECIMAL(10,2),
  first_gift_at TIMESTAMPTZ,
  last_gift_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS tenant_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES tenant_financial_supporters(id) ON DELETE SET NULL,
  stripe_payment_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  donated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giving page settings
CREATE TABLE IF NOT EXISTS tenant_giving_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  goal_amount DECIMAL(10,2),
  goal_description TEXT,
  thank_you_message TEXT,
  show_supporter_names BOOLEAN DEFAULT false,
  suggested_amounts JSONB DEFAULT '[10, 25, 50, 100, 250]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_supporters_tenant ON tenant_financial_supporters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_supporters_stripe ON tenant_financial_supporters(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_donations_tenant ON tenant_donations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_donations_supporter ON tenant_donations(supporter_id);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_payment ON tenant_donations(stripe_payment_id);

-- RLS Policies

-- Financial Supporters
ALTER TABLE tenant_financial_supporters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant owners can view their supporters" ON tenant_financial_supporters;
CREATE POLICY "Tenant owners can view their supporters"
  ON tenant_financial_supporters FOR SELECT
  USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "Tenant owners can manage their supporters" ON tenant_financial_supporters;
CREATE POLICY "Tenant owners can manage their supporters"
  ON tenant_financial_supporters FOR ALL
  USING (tenant_id = auth.uid());

-- Donations
ALTER TABLE tenant_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant owners can view their donations" ON tenant_donations;
CREATE POLICY "Tenant owners can view their donations"
  ON tenant_donations FOR SELECT
  USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "System can create donations" ON tenant_donations;
CREATE POLICY "System can create donations"
  ON tenant_donations FOR INSERT
  WITH CHECK (true);

-- Giving Settings
ALTER TABLE tenant_giving_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view giving settings" ON tenant_giving_settings;
CREATE POLICY "Anyone can view giving settings"
  ON tenant_giving_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Tenant owners can manage their giving settings" ON tenant_giving_settings;
CREATE POLICY "Tenant owners can manage their giving settings"
  ON tenant_giving_settings FOR ALL
  USING (tenant_id = auth.uid());

-- Function to update supporter totals
CREATE OR REPLACE FUNCTION update_supporter_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE tenant_financial_supporters
    SET 
      total_given = total_given + NEW.amount,
      last_gift_at = NEW.donated_at,
      first_gift_at = COALESCE(first_gift_at, NEW.donated_at),
      updated_at = NOW()
    WHERE id = NEW.supporter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_supporter_totals ON tenant_donations;
CREATE TRIGGER trigger_update_supporter_totals
  AFTER INSERT OR UPDATE ON tenant_donations
  FOR EACH ROW
  EXECUTE FUNCTION update_supporter_totals();

-- Insert default giving settings for existing tenants
INSERT INTO tenant_giving_settings (tenant_id)
SELECT id FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM tenant_giving_settings)
ON CONFLICT (tenant_id) DO NOTHING;
