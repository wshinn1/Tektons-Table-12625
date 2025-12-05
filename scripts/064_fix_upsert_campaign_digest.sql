-- Fix upsert_campaign_donation_digest function search_path
-- This function is used by a trigger on the donations table

-- Step 1: Drop the trigger first
DROP TRIGGER IF EXISTS update_campaign_donation_digest ON donations;

-- Step 2: Drop the function
DROP FUNCTION IF EXISTS public.upsert_campaign_donation_digest() CASCADE;

-- Step 3: Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.upsert_campaign_donation_digest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO campaign_donation_digest (campaign_id, total_amount, donation_count, last_updated)
  VALUES (NEW.campaign_id, NEW.amount, 1, NOW())
  ON CONFLICT (campaign_id)
  DO UPDATE SET
    total_amount = campaign_donation_digest.total_amount + NEW.amount,
    donation_count = campaign_donation_digest.donation_count + 1,
    last_updated = NOW();
  RETURN NEW;
END;
$$;

-- Step 4: Recreate the trigger
CREATE TRIGGER update_campaign_donation_digest
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_campaign_donation_digest();
