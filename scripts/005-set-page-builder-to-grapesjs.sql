-- Update the tenant's page builder type to use GrapesJS instead of Unlayer
UPDATE tenants 
SET page_builder_type = 'grapesjs'
WHERE subdomain = 'wesshinn';

-- Verify the update
SELECT subdomain, page_builder_enabled, page_builder_type 
FROM tenants 
WHERE subdomain = 'wesshinn';
