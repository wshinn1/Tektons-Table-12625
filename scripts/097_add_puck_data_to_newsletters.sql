-- Phase 4: Add puck_data column for Puck email builder
-- This migration adds support for the visual email builder

ALTER TABLE tenant_newsletters 
ADD COLUMN IF NOT EXISTS puck_data JSONB;

-- Add comment explaining the column
COMMENT ON COLUMN tenant_newsletters.puck_data IS 'Stores Puck editor JSON data for the visual email builder';
