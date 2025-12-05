-- Media Library for managing uploaded images
-- This table stores all uploaded media files with metadata

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL, -- Changed to TEXT to support 'platform' value
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Added IF NOT EXISTS to make indexes idempotent
-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_library_tenant_id ON media_library(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_mime_type ON media_library(mime_type);

-- RLS Policies
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Added DROP POLICY IF EXISTS to make policies idempotent
-- Super admins can do everything - using super_admins table
DROP POLICY IF EXISTS "Super admins have full access to media_library" ON media_library;
CREATE POLICY "Super admins have full access to media_library"
  ON media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM super_admins
      WHERE super_admins.id = auth.uid()
    )
  );

-- Platform media (tenant_id = 'platform') is visible to all authenticated users
DROP POLICY IF EXISTS "Platform media is visible to all authenticated users" ON media_library;
CREATE POLICY "Platform media is visible to all authenticated users"
  ON media_library
  FOR SELECT
  USING (
    tenant_id = 'platform' AND auth.uid() IS NOT NULL
  );

-- Tenant users can view their tenant's media
DROP POLICY IF EXISTS "Tenant users can view their tenant's media" ON media_library;
CREATE POLICY "Tenant users can view their tenant's media"
  ON media_library
  FOR SELECT
  USING (
    tenant_id::uuid IN (
      SELECT tenant_id FROM supporter_profiles WHERE id = auth.uid()
    )
  );

-- Tenant users can insert their tenant's media
DROP POLICY IF EXISTS "Tenant users can insert their tenant's media" ON media_library;
CREATE POLICY "Tenant users can insert their tenant's media"
  ON media_library
  FOR INSERT
  WITH CHECK (
    tenant_id::uuid IN (
      SELECT tenant_id FROM supporter_profiles WHERE id = auth.uid()
    )
  );

-- Tenant users can update their tenant's media
DROP POLICY IF EXISTS "Tenant users can update their tenant's media" ON media_library;
CREATE POLICY "Tenant users can update their tenant's media"
  ON media_library
  FOR UPDATE
  USING (
    tenant_id::uuid IN (
      SELECT tenant_id FROM supporter_profiles WHERE id = auth.uid()
    )
  );

-- Tenant users can delete their tenant's media
DROP POLICY IF EXISTS "Tenant users can delete their tenant's media" ON media_library;
CREATE POLICY "Tenant users can delete their tenant's media"
  ON media_library
  FOR DELETE
  USING (
    tenant_id::uuid IN (
      SELECT tenant_id FROM supporter_profiles WHERE id = auth.uid()
    )
  );
