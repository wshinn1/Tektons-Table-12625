-- Add Support link to navigation menu
INSERT INTO menu_items (label, url, position, published, navigation_side)
VALUES ('Support', '/support', 7, true, 'left')
ON CONFLICT DO NOTHING;
