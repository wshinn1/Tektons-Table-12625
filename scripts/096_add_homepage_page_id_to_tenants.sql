-- Add homepage_page_id column to tenants table for custom homepage selection
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS homepage_page_id UUID REFERENCES tenant_pages(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN tenants.homepage_page_id IS 'Optional reference to a custom page to use as the tenant homepage';
