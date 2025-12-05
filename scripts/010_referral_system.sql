-- Referral System for Tektons Table
-- Implements tiered pricing based on referrals

-- Drop existing tables if they exist (CASCADE will drop associated policies)
DROP TABLE IF EXISTS pricing_history CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS tenant_pricing CASCADE;

-- Referral codes table
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  code TEXT UNIQUE NOT NULL,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals tracking table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  referee_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant pricing table
CREATE TABLE tenant_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  current_rate_percentage DECIMAL(5,2) DEFAULT 3.50,
  referral_count INTEGER DEFAULT 0,
  rate_tier TEXT DEFAULT 'standard',
  discounted_until TIMESTAMPTZ,
  lifetime_rate_percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing history for audit trail
CREATE TABLE pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  old_rate_percentage DECIMAL(5,2),
  new_rate_percentage DECIMAL(5,2),
  reason TEXT NOT NULL,
  referral_id UUID REFERENCES referrals(id),
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "referral_codes_select_own" ON referral_codes
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "referral_codes_insert_own" ON referral_codes
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- RLS Policies for referrals
CREATE POLICY "referrals_select_own" ON referrals
  FOR SELECT USING (referrer_tenant_id = auth.uid() OR referee_tenant_id = auth.uid());

CREATE POLICY "referrals_insert_own" ON referrals
  FOR INSERT WITH CHECK (referee_tenant_id = auth.uid());

-- RLS Policies for tenant_pricing
CREATE POLICY "tenant_pricing_select_own" ON tenant_pricing
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "tenant_pricing_update_own" ON tenant_pricing
  FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

-- RLS Policies for pricing_history
CREATE POLICY "pricing_history_select_own" ON pricing_history
  FOR SELECT USING (tenant_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_referral_codes_tenant ON referral_codes(tenant_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_tenant_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_tenant_id);
CREATE INDEX idx_tenant_pricing_tenant ON tenant_pricing(tenant_id);
CREATE INDEX idx_pricing_history_tenant ON pricing_history(tenant_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(tenant_name TEXT)
RETURNS TEXT AS $$
DECLARE
  random_suffix TEXT;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    new_code := UPPER(REPLACE(tenant_name, ' ', '-')) || '-MISSIONS-' || random_suffix;
    
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create referral code and pricing for new tenants
CREATE OR REPLACE FUNCTION create_tenant_referral_data()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate referral code
  new_code := generate_referral_code(NEW.full_name);
  
  INSERT INTO referral_codes (tenant_id, code)
  VALUES (NEW.id, new_code);
  
  -- Create pricing record with welcome discount (2.5% for 30 days)
  INSERT INTO tenant_pricing (
    tenant_id,
    current_rate_percentage,
    referral_count,
    rate_tier,
    discounted_until
  ) VALUES (
    NEW.id,
    2.50,
    0,
    'welcome',
    NOW() + INTERVAL '30 days'
  );
  
  -- Log pricing history
  INSERT INTO pricing_history (
    tenant_id,
    old_rate_percentage,
    new_rate_percentage,
    reason,
    effective_date,
    expires_at
  ) VALUES (
    NEW.id,
    3.50,
    2.50,
    'new_signup',
    NOW(),
    NOW() + INTERVAL '30 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_tenant_referral_data
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION create_tenant_referral_data();
