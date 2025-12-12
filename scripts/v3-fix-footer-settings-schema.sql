-- Fix footer_settings table schema to use menu_columns instead of separate column fields

-- Drop old columns if they exist
ALTER TABLE footer_settings DROP COLUMN IF EXISTS product_column_title;
ALTER TABLE footer_settings DROP COLUMN IF EXISTS product_links;
ALTER TABLE footer_settings DROP COLUMN IF EXISTS company_column_title;
ALTER TABLE footer_settings DROP COLUMN IF EXISTS company_links;
ALTER TABLE footer_settings DROP COLUMN IF EXISTS connect_column_title;
ALTER TABLE footer_settings DROP COLUMN IF EXISTS connect_links;

-- Add menu_columns as JSONB if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'footer_settings' AND column_name = 'menu_columns'
  ) THEN
    ALTER TABLE footer_settings ADD COLUMN menu_columns JSONB DEFAULT '[
      {
        "title": "Product",
        "links": [
          {"label": "Features", "url": "/features"},
          {"label": "Pricing", "url": "/pricing"},
          {"label": "Example", "url": "/example"}
        ]
      },
      {
        "title": "Company",
        "links": [
          {"label": "About", "url": "/about"},
          {"label": "Privacy", "url": "/privacy"},
          {"label": "Terms", "url": "/terms"}
        ]
      },
      {
        "title": "Connect",
        "links": [
          {"label": "Contact", "url": "/contact"},
          {"label": "Blog", "url": "/blog"},
          {"label": "Login", "url": "/auth/login"}
        ]
      }
    ]'::jsonb;
  END IF;
END $$;

-- Update existing row if menu_columns is null
UPDATE footer_settings 
SET menu_columns = '[
  {
    "title": "Product",
    "links": [
      {"label": "Features", "url": "/features"},
      {"label": "Pricing", "url": "/pricing"},
      {"label": "Example", "url": "/example"}
    ]
  },
  {
    "title": "Company",
    "links": [
      {"label": "About", "url": "/about"},
      {"label": "Privacy", "url": "/privacy"},
      {"label": "Terms", "url": "/terms"}
    ]
  },
  {
    "title": "Connect",
    "links": [
      {"label": "Contact", "url": "/contact"},
      {"label": "Blog", "url": "/blog"},
      {"label": "Login", "url": "/auth/login"}
    ]
  }
]'::jsonb
WHERE menu_columns IS NULL;
