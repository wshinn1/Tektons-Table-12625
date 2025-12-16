-- Remove Plasmic-specific columns since Puck doesn't require per-tenant configuration
ALTER TABLE tenants
DROP COLUMN IF EXISTS plasmic_project_id,
DROP COLUMN IF EXISTS plasmic_api_token,
DROP COLUMN IF EXISTS page_builder_requested,
DROP COLUMN IF EXISTS page_builder_requested_at;
