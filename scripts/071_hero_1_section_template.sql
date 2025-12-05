-- Hero Custom 1 Section Template
-- Full-width hero with background image/gradient/CDN, overlay, left-aligned content, and social icons

-- Use DO block with UPDATE or INSERT to avoid foreign key constraint issues
DO $$
DECLARE
  existing_id UUID;
BEGIN
  -- Check if Hero Custom 1 already exists
  SELECT id INTO existing_id FROM section_templates WHERE name = 'Hero Custom 1' LIMIT 1;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing record to preserve foreign key relationships
    UPDATE section_templates SET
      component_path = 'sections/hero-1',
      category = 'hero',
      thumbnail_url = '/hero-section-with-overlay.jpg',
      description = 'Full-width hero with background image/gradient/CDN, overlay, left-aligned content, and social icons',
      field_schema = '{
        "fields": [
          {"name": "subtitle", "label": "Subtitle", "type": "text", "required": false},
          {"name": "headline", "label": "Headline", "type": "text", "required": true},
          {"name": "description", "label": "Description", "type": "textarea", "required": false},
          {"name": "buttonText", "label": "Button Text", "type": "text", "required": false},
          {"name": "buttonLink", "label": "Button Link", "type": "url", "required": false},
          {"name": "buttonColor", "label": "Button Color", "type": "color", "required": false},
          {"name": "backgroundType", "label": "Background Type", "type": "select", "options": ["image", "cdn", "gradient"], "required": false},
          {"name": "backgroundImage", "label": "Background Image URL", "type": "url", "required": false},
          {"name": "cdnLink", "label": "CDN Image Link", "type": "url", "required": false},
          {"name": "gradientStart", "label": "Gradient Start Color", "type": "color", "required": false},
          {"name": "gradientEnd", "label": "Gradient End Color", "type": "color", "required": false},
          {"name": "gradientDirection", "label": "Gradient Direction", "type": "select", "options": ["to-r", "to-l", "to-t", "to-b", "to-br", "to-bl", "to-tr", "to-tl"], "required": false},
          {"name": "overlayColor", "label": "Overlay Color", "type": "color", "required": false},
          {"name": "overlayOpacity", "label": "Overlay Opacity (%)", "type": "number", "required": false},
          {"name": "textColor", "label": "Text Color", "type": "color", "required": false},
          {"name": "showSocialIcons", "label": "Show Social Icons", "type": "checkbox", "required": false},
          {"name": "facebookUrl", "label": "Facebook URL", "type": "url", "required": false},
          {"name": "instagramUrl", "label": "Instagram URL", "type": "url", "required": false},
          {"name": "youtubeUrl", "label": "YouTube URL", "type": "url", "required": false},
          {"name": "showPaginationDots", "label": "Show Pagination Dots", "type": "checkbox", "required": false}
        ]
      }'::jsonb,
      default_props = '{
        "subtitle": "WELCOME",
        "headline": "Discover New Places",
        "description": "These cases are perfectly simple and easy to distinguish. In a free hour when our power of choice is untrammelled and when nothing prevents our being able to do what we like best every pleasure.",
        "buttonText": "Learn More",
        "buttonLink": "/about",
        "buttonColor": "#2563eb",
        "backgroundType": "image",
        "backgroundImage": "/majestic-mountain-vista.png",
        "cdnLink": "",
        "gradientStart": "#1a1a2e",
        "gradientEnd": "#16213e",
        "gradientDirection": "to-br",
        "overlayColor": "#000000",
        "overlayOpacity": 40,
        "textColor": "#ffffff",
        "showSocialIcons": true,
        "facebookUrl": "#",
        "instagramUrl": "#",
        "youtubeUrl": "#",
        "showPaginationDots": true
      }'::jsonb,
      updated_at = NOW()
    WHERE id = existing_id;
  ELSE
    -- Insert new record
    INSERT INTO section_templates (name, component_path, category, thumbnail_url, description, field_schema, default_props)
    VALUES (
      'Hero Custom 1',
      'sections/hero-1',
      'hero',
      '/hero-section-with-overlay.jpg',
      'Full-width hero with background image/gradient/CDN, overlay, left-aligned content, and social icons',
      '{
        "fields": [
          {"name": "subtitle", "label": "Subtitle", "type": "text", "required": false},
          {"name": "headline", "label": "Headline", "type": "text", "required": true},
          {"name": "description", "label": "Description", "type": "textarea", "required": false},
          {"name": "buttonText", "label": "Button Text", "type": "text", "required": false},
          {"name": "buttonLink", "label": "Button Link", "type": "url", "required": false},
          {"name": "buttonColor", "label": "Button Color", "type": "color", "required": false},
          {"name": "backgroundType", "label": "Background Type", "type": "select", "options": ["image", "cdn", "gradient"], "required": false},
          {"name": "backgroundImage", "label": "Background Image URL", "type": "url", "required": false},
          {"name": "cdnLink", "label": "CDN Image Link", "type": "url", "required": false},
          {"name": "gradientStart", "label": "Gradient Start Color", "type": "color", "required": false},
          {"name": "gradientEnd", "label": "Gradient End Color", "type": "color", "required": false},
          {"name": "gradientDirection", "label": "Gradient Direction", "type": "select", "options": ["to-r", "to-l", "to-t", "to-b", "to-br", "to-bl", "to-tr", "to-tl"], "required": false},
          {"name": "overlayColor", "label": "Overlay Color", "type": "color", "required": false},
          {"name": "overlayOpacity", "label": "Overlay Opacity (%)", "type": "number", "required": false},
          {"name": "textColor", "label": "Text Color", "type": "color", "required": false},
          {"name": "showSocialIcons", "label": "Show Social Icons", "type": "checkbox", "required": false},
          {"name": "facebookUrl", "label": "Facebook URL", "type": "url", "required": false},
          {"name": "instagramUrl", "label": "Instagram URL", "type": "url", "required": false},
          {"name": "youtubeUrl", "label": "YouTube URL", "type": "url", "required": false},
          {"name": "showPaginationDots", "label": "Show Pagination Dots", "type": "checkbox", "required": false}
        ]
      }'::jsonb,
      '{
        "subtitle": "WELCOME",
        "headline": "Discover New Places",
        "description": "These cases are perfectly simple and easy to distinguish. In a free hour when our power of choice is untrammelled and when nothing prevents our being able to do what we like best every pleasure.",
        "buttonText": "Learn More",
        "buttonLink": "/about",
        "buttonColor": "#2563eb",
        "backgroundType": "image",
        "backgroundImage": "/majestic-mountain-vista.png",
        "cdnLink": "",
        "gradientStart": "#1a1a2e",
        "gradientEnd": "#16213e",
        "gradientDirection": "to-br",
        "overlayColor": "#000000",
        "overlayOpacity": 40,
        "textColor": "#ffffff",
        "showSocialIcons": true,
        "facebookUrl": "#",
        "instagramUrl": "#",
        "youtubeUrl": "#",
        "showPaginationDots": true
      }'::jsonb
    );
  END IF;
END $$;
