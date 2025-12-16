-- Remove page builder request tracking columns (no longer needed with Puck)
ALTER TABLE tenants
DROP COLUMN IF EXISTS page_builder_requested,
DROP COLUMN IF EXISTS page_builder_requested_at,
DROP COLUMN IF EXISTS plasmic_project_id,
DROP COLUMN IF EXISTS plasmic_api_token;

-- Remove old page_builder_type column if it exists
ALTER TABLE tenants
DROP COLUMN IF EXISTS page_builder_type;
