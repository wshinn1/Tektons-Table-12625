-- Copy the exact blog post content from wesshinn to aofaith
-- This will update the aofaith "the-setup" post with the exact content from wesshinn

UPDATE blog_posts
SET 
  title = source.title,
  excerpt = source.excerpt,
  content = source.content,
  featured_image_url = source.featured_image_url,
  status = source.status,
  meta_description = source.meta_description,
  read_time_minutes = source.read_time_minutes,
  updated_at = NOW()
FROM (
  SELECT 
    bp.title,
    bp.excerpt,
    bp.content,
    bp.featured_image_url,
    bp.status,
    bp.meta_description,
    bp.read_time_minutes
  FROM blog_posts bp
  JOIN tenants t ON bp.tenant_id::text = t.id::text
  WHERE t.subdomain = 'wesshinn'
  AND bp.slug = 'the-setup'
) AS source
WHERE blog_posts.slug = 'the-setup'
AND blog_posts.tenant_id::text = (
  SELECT id::text FROM tenants WHERE subdomain = 'aofaith'
);
