-- Remove the hero section from wesshinn's homepage
-- This will remove the "Wes Shinn" / "Test" heading that appears on the homepage

DELETE FROM page_sections 
WHERE page_id IN (
  SELECT id FROM pages 
  WHERE tenant_id = '454bfb45-fb73-433a-b57e-445c72ced9dc' 
  AND is_homepage = true
);
