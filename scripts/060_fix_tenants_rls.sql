-- Fix RLS policies on tenants table
-- The tenants table uses 'id' as the column (not 'tenant_id')
-- This script ensures all policies use the correct column name

-- First, drop ALL existing policies on tenants table
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_delete_own" ON public.tenants;
DROP POLICY IF EXISTS "Allow public read of tenant profiles" ON public.tenants;
DROP POLICY IF EXISTS "Allow users to read own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Allow users to insert own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Allow users to update own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Allow users to delete own tenant" ON public.tenants;
DROP POLICY IF EXISTS "tenants_public_read" ON public.tenants;
DROP POLICY IF EXISTS "tenant_read_own" ON public.tenants;
DROP POLICY IF EXISTS "tenant_insert_own" ON public.tenants;
DROP POLICY IF EXISTS "tenant_update_own" ON public.tenants;
DROP POLICY IF EXISTS "tenant_delete_own" ON public.tenants;

-- Also try to drop any policy that might exist with other names
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'tenants' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tenants', pol.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Recreate policies using correct column name (id, not tenant_id)
-- Policy 1: Anyone can read tenant profiles (for public pages)
CREATE POLICY "tenants_public_read" ON public.tenants 
FOR SELECT 
USING (true);

-- Policy 2: Users can insert their own tenant (id = their auth.uid())
CREATE POLICY "tenants_insert_own" ON public.tenants 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own tenant
CREATE POLICY "tenants_update_own" ON public.tenants 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own tenant
CREATE POLICY "tenants_delete_own" ON public.tenants 
FOR DELETE 
USING (auth.uid() = id);

-- Verify the policies were created correctly
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'tenants' AND schemaname = 'public';
