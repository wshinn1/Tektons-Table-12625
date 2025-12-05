-- Fix media_library RLS policies to use correct column names
-- The super_admins table has 'user_id' not 'id' for the auth user reference

-- Drop and recreate the super admin policy with correct column
DROP POLICY IF EXISTS "Super admins have full access to media_library" ON media_library;
CREATE POLICY "Super admins have full access to media_library"
  ON media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );
