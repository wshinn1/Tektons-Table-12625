-- Add branding columns to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS site_title TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS site_description TEXT;

-- Set default values for existing tenants (TektonsTable branding)
UPDATE tenants 
SET 
  favicon_url = COALESCE(favicon_url, '/images/android-chrome-512x512.png'),
  og_image_url = COALESCE(og_image_url, '/images/tektons-20table-whitebg.png'),
  site_title = COALESCE(site_title, 'Long Term Funding Support'),
  site_description = COALESCE(site_description, 'Support missionaries and ministries with recurring donations through TektonsTable')
WHERE favicon_url IS NULL OR og_image_url IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN tenants.favicon_url IS 'URL for the site favicon/icon. Defaults to TektonsTable logo.';
COMMENT ON COLUMN tenants.og_image_url IS 'URL for Open Graph/social sharing image. Defaults to TektonsTable logo.';
COMMENT ON COLUMN tenants.site_title IS 'Custom site title for SEO and browser tabs. Defaults to "Long Term Funding Support".';
COMMENT ON COLUMN tenants.site_description IS 'Custom site description for SEO and social sharing.';
