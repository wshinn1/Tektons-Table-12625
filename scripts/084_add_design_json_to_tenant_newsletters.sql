-- Add design_json column to tenant_newsletters table
-- This column stores the editor design JSON for re-editing newsletters

ALTER TABLE tenant_newsletters
ADD COLUMN IF NOT EXISTS design_json JSONB;

COMMENT ON COLUMN tenant_newsletters.design_json IS 'Stores email editor design JSON for re-editing newsletters';
