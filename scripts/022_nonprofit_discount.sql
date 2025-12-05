-- Add nonprofit discount tracking to tenants table

-- Add nonprofit fields if they don't exist
DO $$ 
BEGIN
  -- Check and add is_nonprofit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'is_nonprofit'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN is_nonprofit BOOLEAN DEFAULT false;
  END IF;

  -- Check and add nonprofit_verification_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'nonprofit_verification_status'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN nonprofit_verification_status TEXT DEFAULT 'unverified';
  END IF;

  -- Check and add nonprofit_verified_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'nonprofit_verified_at'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN nonprofit_verified_at TIMESTAMPTZ;
  END IF;

  -- Check and add nonprofit_ein column (for 501c3 verification)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'nonprofit_ein'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN nonprofit_ein TEXT;
  END IF;
END $$;

-- Add comment explaining the verification statuses
COMMENT ON COLUMN public.tenants.nonprofit_verification_status IS 
  'Verification status for nonprofit discount: unverified, pending, verified, rejected';
