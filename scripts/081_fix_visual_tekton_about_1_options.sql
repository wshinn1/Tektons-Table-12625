-- Update Visual Tekton About 1 section template to fix field_schema options

UPDATE section_templates
SET field_schema = '{
  "fields": [
    {"name": "label", "label": "Label", "type": "text", "required": false},
    {"name": "headline", "label": "Headline", "type": "text", "required": true},
    {"name": "body1", "label": "Body Paragraph 1", "type": "textarea", "required": false},
    {"name": "body2", "label": "Body Paragraph 2", "type": "textarea", "required": false},
    {"name": "body3", "label": "Body Paragraph 3 (Bottom Right)", "type": "textarea", "required": false},
    {"name": "media1_type", "label": "Media 1 Type", "type": "select", "options": ["image", "cdn"], "default": "image"},
    {"name": "media1_url", "label": "Media 1 URL", "type": "url", "required": false},
    {"name": "media2_type", "label": "Media 2 Type", "type": "select", "options": ["image", "cdn"], "default": "image"},
    {"name": "media2_url", "label": "Media 2 URL", "type": "url", "required": false}
  ]
}'::jsonb
WHERE name = 'Visual Tekton About 1';
