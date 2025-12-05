-- Fix remaining security warnings

-- 1. Fix common_questions view (if chat_messages table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages' AND table_schema = 'public') THEN
    -- Drop and recreate with security_invoker
    DROP VIEW IF EXISTS public.common_questions;
    
    EXECUTE '
      CREATE VIEW public.common_questions
      WITH (security_invoker = true)
      AS
      SELECT 
        message as question,
        COUNT(*) as frequency
      FROM public.chat_messages
      WHERE role = ''user''
      GROUP BY message
      ORDER BY frequency DESC
      LIMIT 50
    ';
  ELSE
    -- Table doesn't exist, just drop the view
    DROP VIEW IF EXISTS public.common_questions;
  END IF;
END $$;

-- 2. Fix upsert_campaign_donation_digest function
-- First drop the trigger that depends on it
DROP TRIGGER IF EXISTS update_campaign_donation_digest ON public.donations;

-- Drop the function
DROP FUNCTION IF EXISTS public.upsert_campaign_donation_digest() CASCADE;

-- Recreate with secure search_path
CREATE OR REPLACE FUNCTION public.upsert_campaign_donation_digest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.campaign_donation_digests (campaign_id, total_amount, donation_count, last_updated)
  VALUES (NEW.campaign_id, NEW.amount, 1, NOW())
  ON CONFLICT (campaign_id)
  DO UPDATE SET
    total_amount = campaign_donation_digests.total_amount + EXCLUDED.total_amount,
    donation_count = campaign_donation_digests.donation_count + 1,
    last_updated = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger if donations table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donations' AND table_schema = 'public') THEN
    CREATE TRIGGER update_campaign_donation_digest
      AFTER INSERT ON public.donations
      FOR EACH ROW
      EXECUTE FUNCTION public.upsert_campaign_donation_digest();
  END IF;
END $$;
