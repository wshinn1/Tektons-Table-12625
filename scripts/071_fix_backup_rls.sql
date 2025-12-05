-- Fix RLS policies for backups table to allow service role inserts

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert backups" ON backups;
DROP POLICY IF EXISTS "Service role can update backups" ON backups;
DROP POLICY IF EXISTS "Super admins can view all backups" ON backups;

-- Allow service role to insert and update backups (for cron jobs)
CREATE POLICY "Service role can insert backups" ON backups
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update backups" ON backups
  FOR UPDATE
  TO service_role
  USING (true);

-- Allow authenticated super admins to view backups
CREATE POLICY "Super admins can view all backups" ON backups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.user_id = auth.uid()
    )
  );

-- Grant service role full access
GRANT ALL ON backups TO service_role;
