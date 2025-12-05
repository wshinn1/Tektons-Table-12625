-- Phase 1: Core Database Schema for Tektons Table
-- Multi-tenant missionary fundraising platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table (missionary accounts)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  mission_organization TEXT,
  location TEXT,
  ministry_focus TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  language TEXT DEFAULT 'en',
  
  -- Referral & Pricing
  referral_code TEXT UNIQUE NOT NULL,
  referred_by_tenant_id UUID REFERENCES public.tenants(id),
  referral_count INT DEFAULT 0,
  platform_fee_percentage DECIMAL(5,2) DEFAULT 2.50, -- Welcome discount
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to avoid conflicts
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_delete_own" ON public.tenants;

-- Tenants policies
CREATE POLICY "tenants_select_own" ON public.tenants FOR SELECT USING (auth.uid() = id);
CREATE POLICY "tenants_insert_own" ON public.tenants FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "tenants_update_own" ON public.tenants FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "tenants_delete_own" ON public.tenants FOR DELETE USING (auth.uid() = id);

-- Support tiers table
CREATE TABLE IF NOT EXISTS public.support_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  benefits TEXT[],
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_tiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "support_tiers_select_public" ON public.support_tiers;
DROP POLICY IF EXISTS "support_tiers_insert_own" ON public.support_tiers;
DROP POLICY IF EXISTS "support_tiers_update_own" ON public.support_tiers;
DROP POLICY IF EXISTS "support_tiers_delete_own" ON public.support_tiers;

CREATE POLICY "support_tiers_select_public" ON public.support_tiers FOR SELECT USING (true);
CREATE POLICY "support_tiers_insert_own" ON public.support_tiers FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "support_tiers_update_own" ON public.support_tiers FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "support_tiers_delete_own" ON public.support_tiers FOR DELETE USING (auth.uid() = tenant_id);

-- Posts/Updates table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "posts_select_published" ON public.posts;
DROP POLICY IF EXISTS "posts_select_own" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;

CREATE POLICY "posts_select_published" ON public.posts FOR SELECT USING (is_published = true);
CREATE POLICY "posts_select_own" ON public.posts FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = tenant_id);

-- Supporters/Donors table
CREATE TABLE IF NOT EXISTS public.supporters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  total_donated DECIMAL(10,2) DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_amount DECIMAL(10,2),
  last_donation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "supporters_select_own_tenant" ON public.supporters;
DROP POLICY IF EXISTS "supporters_insert_own_tenant" ON public.supporters;
DROP POLICY IF EXISTS "supporters_update_own_tenant" ON public.supporters;

CREATE POLICY "supporters_select_own_tenant" ON public.supporters FOR SELECT USING (
  auth.uid() = tenant_id
);
CREATE POLICY "supporters_insert_own_tenant" ON public.supporters FOR INSERT WITH CHECK (
  auth.uid() = tenant_id
);
CREATE POLICY "supporters_update_own_tenant" ON public.supporters FOR UPDATE USING (
  auth.uid() = tenant_id
);

-- Donations tracking (metadata only, no payment info)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supporter_id UUID NOT NULL REFERENCES public.supporters(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  stripe_fee DECIMAL(10,2),
  tip_amount DECIMAL(10,2) DEFAULT 0,
  supporter_covered_stripe_fee BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones
DROP POLICY IF EXISTS "donations_select_own_tenant" ON public.donations;

CREATE POLICY "donations_select_own_tenant" ON public.donations FOR SELECT USING (
  auth.uid() = tenant_id
);

-- Create indexes for performance (IF NOT EXISTS not supported, wrapped in DO block)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenants_subdomain') THEN
    CREATE INDEX idx_tenants_subdomain ON public.tenants(subdomain);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenants_referral_code') THEN
    CREATE INDEX idx_tenants_referral_code ON public.tenants(referral_code);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_tenant_published') THEN
    CREATE INDEX idx_posts_tenant_published ON public.posts(tenant_id, is_published, published_at DESC);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_supporters_tenant_email') THEN
    CREATE INDEX idx_supporters_tenant_email ON public.supporters(tenant_id, email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donations_tenant_created') THEN
    CREATE INDEX idx_donations_tenant_created ON public.donations(tenant_id, created_at DESC);
  END IF;
END $$;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(tenant_name TEXT) 
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INT := 0;
BEGIN
  -- Create base code from name (first 3 chars + 4 random chars)
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(tenant_name, '[^a-zA-Z0-9]', '', 'g'), 1, 3)) || 
               UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
  
  final_code := base_code;
  
  -- Ensure uniqueness
  WHILE EXISTS(SELECT 1 FROM public.tenants WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers before creating new ones
DROP TRIGGER IF EXISTS update_tenants_updated_at ON public.tenants;
DROP TRIGGER IF EXISTS update_support_tiers_updated_at ON public.support_tiers;
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
DROP TRIGGER IF EXISTS update_supporters_updated_at ON public.supporters;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tiers_updated_at BEFORE UPDATE ON public.support_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supporters_updated_at BEFORE UPDATE ON public.supporters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
