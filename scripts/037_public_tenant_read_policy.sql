-- Enable public read access to active tenant profiles
-- This allows anyone to view missionary pages without authentication

CREATE POLICY "tenants_select_public_active" 
ON public.tenants 
FOR SELECT 
TO public
USING (is_active = true);

-- Add comment explaining the policy
COMMENT ON POLICY "tenants_select_public_active" ON public.tenants IS 
'Allows public read access to active tenant profiles so their missionary pages can be viewed without authentication';
