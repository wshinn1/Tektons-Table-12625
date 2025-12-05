-- Insert help categories
INSERT INTO help_categories (id, slug, name, icon, order_index, created_at)
VALUES
  (
    gen_random_uuid(),
    'getting-started',
    '{"en": "Getting Started", "es": "Comenzando"}'::jsonb,
    'book-open',
    1,
    NOW()
  ),
  (
    gen_random_uuid(),
    'fundraising',
    '{"en": "Fundraising", "es": "Recaudación de fondos"}'::jsonb,
    'dollar-sign',
    2,
    NOW()
  ),
  (
    gen_random_uuid(),
    'content-communication',
    '{"en": "Content & Communication", "es": "Contenido y Comunicación"}'::jsonb,
    'book-open',
    3,
    NOW()
  ),
  (
    gen_random_uuid(),
    'financial-management',
    '{"en": "Financial Management", "es": "Gestión Financiera"}'::jsonb,
    'book-open',
    4,
    NOW()
  ),
  (
    gen_random_uuid(),
    'settings-customization',
    '{"en": "Settings & Customization", "es": "Configuración y Personalización"}'::jsonb,
    'settings',
    5,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;
