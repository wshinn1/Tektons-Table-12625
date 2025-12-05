-- Add platform Stripe account ID to platform_settings table

-- Add stripe_account_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_settings' 
    AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE platform_settings ADD COLUMN stripe_account_id TEXT;
  END IF;
END $$;

-- Add stripe_account_email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_settings' 
    AND column_name = 'stripe_account_email'
  ) THEN
    ALTER TABLE platform_settings ADD COLUMN stripe_account_email TEXT;
  END IF;
END $$;

-- Add stripe_connected_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_settings' 
    AND column_name = 'stripe_connected_at'
  ) THEN
    ALTER TABLE platform_settings ADD COLUMN stripe_connected_at TIMESTAMPTZ;
  END IF;
END $$;
