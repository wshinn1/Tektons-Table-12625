-- Check all platform pages and their publish status
SELECT id, title, slug, is_published, is_homepage, editor_type, html_content IS NOT NULL as has_html, created_at 
FROM pages 
ORDER BY created_at DESC 
LIMIT 20;
