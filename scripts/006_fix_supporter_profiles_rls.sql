-- Fix supporter_profiles RLS to allow insertions during signup
-- This script adds an INSERT policy for authenticated users creating their own profile

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "supporters_insert_own" ON supporter_profiles;

-- Allow users to insert their own supporter profile during signup
CREATE POLICY "supporters_insert_own"
  ON supporter_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow service role to insert (for admin operations)
CREATE POLICY "service_role_insert_supporters"
  ON supporter_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);
