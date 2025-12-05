-- Contact Messages System for Phase 15

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'spam')),
  ip_address text,
  user_agent text,
  replied_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_tenant_id ON contact_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message (INSERT only)
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Tenant owners can view their own messages
CREATE POLICY "Tenant owners can view their messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Tenant owners can update their messages (mark as read, etc.)
CREATE POLICY "Tenant owners can update their messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Tenant owners can delete their messages
CREATE POLICY "Tenant owners can delete their messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE user_id = auth.uid()
    )
  );

-- Super admins can view all messages
CREATE POLICY "Super admins can view all messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT user_id FROM super_admins)
  );

-- Function to count unread messages
CREATE OR REPLACE FUNCTION get_unread_message_count(tenant_uuid uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM contact_messages
  WHERE tenant_id = tenant_uuid AND status = 'unread';
$$ LANGUAGE sql STABLE;
