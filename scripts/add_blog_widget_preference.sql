-- Add blog_widget_preference column to tenant_giving_settings
-- This allows tenants to choose which widget displays on blog posts
ALTER TABLE tenant_giving_settings
ADD COLUMN IF NOT EXISTS blog_widget_preference TEXT DEFAULT 'giving' CHECK (blog_widget_preference IN ('giving', 'campaign'));

-- Add comment explaining the column
COMMENT ON COLUMN tenant_giving_settings.blog_widget_preference IS 'Widget to display on blog post pages: giving (default support widget) or campaign (active campaign widget)';
