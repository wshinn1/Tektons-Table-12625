-- Backup tracking table
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text DEFAULT 'full',
  blob_url text,
  blob_key text,
  file_size_bytes bigint,
  tables_backed_up text[],
  record_count integer,
  status text DEFAULT 'in_progress',
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS: Only super admins can see backups
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_backups_select" ON backups;
-- Removed is_active check since super_admins table doesn't have that column
CREATE POLICY "super_admin_backups_select" ON backups
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Index for querying recent backups
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
