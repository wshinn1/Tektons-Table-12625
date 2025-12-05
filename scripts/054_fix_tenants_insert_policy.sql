-- Fix tenant INSERT policy to allow authenticated users to create their own tenant records
-- This resolves the 403 error during onboarding when users try to complete setup

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_delete_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_public_active" ON public.tenants;

-- Recreate policies with proper TO role specifications

-- Select: Authenticated users can read their own tenant
CREATE POLICY "tenants_select_own" 
ON public.tenants 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Select: Public can read active tenant profiles (for public missionary pages)
CREATE POLICY "tenants_select_public_active" 
ON public.tenants 
FOR SELECT 
TO public 
USING (is_active = true);

-- Insert: Authenticated users can create their own tenant record
CREATE POLICY "tenants_insert_own" 
ON public.tenants 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Update: Authenticated users can update their own tenant
CREATE POLICY "tenants_update_own" 
ON public.tenants 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Delete: Authenticated users can delete their own tenant
CREATE POLICY "tenants_delete_own" 
ON public.tenants 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);
