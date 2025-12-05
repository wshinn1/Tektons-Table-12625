-- Fix script for tenant insert issues
-- Run this in Supabase SQL Editor

-- First, let's see what triggers exist on the tenants table
-- SELECT tgname, tgtype, proname 
-- FROM pg_trigger t
-- JOIN pg_proc p ON t.tgfoid = p.oid
-- WHERE tgrelid = 'tenants'::regclass;

-- Drop problematic triggers that might reference non-existent tables
DROP TRIGGER IF EXISTS trg_add_tenant_to_contacts ON tenants;
DROP TRIGGER IF EXISTS on_tenant_created_init_navigation ON tenants;

-- The trigger functions reference tables that might not exist
-- Drop the functions too to prevent orphaned references
DROP FUNCTION IF EXISTS add_tenant_to_contact_group() CASCADE;
DROP FUNCTION IF EXISTS initialize_tenant_navigation() CASCADE;

-- Now verify the tenants table structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants';

-- Make sure the basic update trigger exists and works
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate just the basic updated_at trigger
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify RLS policies are correct (using 'id' not 'tenant_id')
DROP POLICY IF EXISTS "tenants_insert_own" ON tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON tenants;
DROP POLICY IF EXISTS "tenants_delete_own" ON tenants;
DROP POLICY IF EXISTS "tenants_public_read" ON tenants;

-- Recreate policies with correct column references
CREATE POLICY "tenants_public_read" ON tenants
  FOR SELECT USING (true);

CREATE POLICY "tenants_insert_own" ON tenants
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "tenants_update_own" ON tenants
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "tenants_delete_own" ON tenants
  FOR DELETE USING (auth.uid() = id);
