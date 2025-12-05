-- Fix the search_path security warning for update_subscriber_groups_updated_at function
CREATE OR REPLACE FUNCTION public.update_subscriber_groups_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
