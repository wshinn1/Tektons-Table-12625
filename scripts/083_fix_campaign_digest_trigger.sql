-- Fix the campaign_donation_digest trigger to use correct columns
-- The trigger was referencing campaign_id which doesn't exist in the table

-- Step 1: Drop the old trigger
DROP TRIGGER IF EXISTS update_campaign_donation_digest ON donations;

-- Step 2: Drop the old function versions
DROP FUNCTION IF EXISTS public.upsert_campaign_donation_digest() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_campaign_donation_digest(UUID, NUMERIC) CASCADE;

-- Step 3: Recreate the trigger function with correct columns matching the actual table schema
-- Table schema: id, tenant_id, notification_date, donation_count, total_amount, created_at, sent_at
CREATE OR REPLACE FUNCTION public.upsert_campaign_donation_digest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process if the donation is for a campaign (has campaign metadata)
  -- For now, we aggregate by tenant_id and notification_date
  INSERT INTO campaign_donation_digest (tenant_id, notification_date, donation_count, total_amount)
  VALUES (NEW.tenant_id, CURRENT_DATE, 1, NEW.amount)
  ON CONFLICT (tenant_id, notification_date)
  DO UPDATE SET
    donation_count = campaign_donation_digest.donation_count + 1,
    total_amount = campaign_donation_digest.total_amount + NEW.amount;
  RETURN NEW;
END;
$$;

-- Step 4: Recreate the trigger
CREATE TRIGGER update_campaign_donation_digest
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_campaign_donation_digest();

-- Also recreate the RPC version for direct calls
CREATE OR REPLACE FUNCTION public.upsert_campaign_donation_digest(
  p_tenant_id UUID,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO campaign_donation_digest (tenant_id, notification_date, donation_count, total_amount)
  VALUES (p_tenant_id, CURRENT_DATE, 1, p_amount)
  ON CONFLICT (tenant_id, notification_date)
  DO UPDATE SET
    donation_count = campaign_donation_digest.donation_count + 1,
    total_amount = campaign_donation_digest.total_amount + p_amount;
END;
$$;

COMMENT ON FUNCTION public.upsert_campaign_donation_digest() IS 'Trigger function to track campaign donations for daily digest emails';
COMMENT ON FUNCTION public.upsert_campaign_donation_digest(UUID, NUMERIC) IS 'RPC function to track campaign donations for daily digest emails';
