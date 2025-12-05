-- Add nonprofit pricing support for tenants
-- Stripe nonprofit rates: 2.2% + $0.30 (vs standard 2.9% + $0.30)

-- Add is_nonprofit column to tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS is_nonprofit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nonprofit_verification_status TEXT DEFAULT 'unverified' CHECK (nonprofit_verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS nonprofit_documentation_url TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_verified_at TIMESTAMPTZ;

-- Add comment explaining the column
COMMENT ON COLUMN public.tenants.is_nonprofit IS 'Whether tenant has opted into nonprofit pricing (requires verification)';
COMMENT ON COLUMN public.tenants.nonprofit_verification_status IS 'Verification status: unverified, pending, verified, rejected';

-- Create nonprofit verification audit table
CREATE TABLE IF NOT EXISTS public.nonprofit_verification_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.nonprofit_verification_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for nonprofit verification audit
CREATE POLICY "Tenants can view their own verification history" 
  ON public.nonprofit_verification_audit FOR SELECT 
  USING (auth.uid() = tenant_id);

CREATE POLICY "Super admins can view all verification history" 
  ON public.nonprofit_verification_audit FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.super_admins 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert verification records" 
  ON public.nonprofit_verification_audit FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.super_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_nonprofit_verification_tenant ON public.nonprofit_verification_audit(tenant_id, created_at DESC);

-- Note: Stripe fee calculation happens in the donation flow
-- The frontend will need to pass is_nonprofit status to calculate correct Stripe fees
