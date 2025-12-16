-- Add Plasmic credentials to tenants table for per-tenant Plasmic projects
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS plasmic_project_id TEXT,
ADD COLUMN IF NOT EXISTS plasmic_api_token TEXT,
ADD COLUMN IF NOT EXISTS page_builder_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS page_builder_requested_at TIMESTAMP;

-- Add comments
COMMENT ON COLUMN tenants.plasmic_project_id IS 'Plasmic project ID for this tenant';
COMMENT ON COLUMN tenants.plasmic_api_token IS 'Plasmic API token for this tenant';
COMMENT ON COLUMN tenants.page_builder_requested IS 'Whether tenant has requested custom page builder';
COMMENT ON COLUMN tenants.page_builder_requested_at IS 'When tenant requested custom page builder';
