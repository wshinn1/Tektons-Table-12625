-- Multi-language support tables

-- Drop existing objects if they exist
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS currency_settings CASCADE;

-- Translations for platform UI
CREATE TABLE IF NOT EXISTS translations (
  id uuid primary key default gen_random_uuid(),
  language_code text not null, -- en, es, pt, fr, ko, zh
  translation_key text not null, -- e.g., "dashboard.welcome"
  translation_value text not null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(language_code, translation_key)
);

-- Currency settings per tenant
CREATE TABLE IF NOT EXISTS currency_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants on delete cascade unique,
  primary_currency text default 'USD', -- ISO 4217 currency code
  display_format text default '${amount}', -- e.g., "$1,000.00" or "€1.000,00"
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- RLS Policies
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read translations
DROP POLICY IF EXISTS "translations_select_all" ON translations;
CREATE POLICY "translations_select_all" ON translations FOR SELECT USING (true);

-- Tenants can manage their own currency settings
DROP POLICY IF EXISTS "currency_settings_select_own" ON currency_settings;
CREATE POLICY "currency_settings_select_own" ON currency_settings 
  FOR SELECT USING (tenant_id = auth.uid());

DROP POLICY IF EXISTS "currency_settings_update_own" ON currency_settings;
CREATE POLICY "currency_settings_update_own" ON currency_settings 
  FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

-- Insert default translations (sample set)
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('en', 'dashboard.welcome', 'Welcome to Tektons Table'),
('es', 'dashboard.welcome', 'Bienvenido a Tektons Table'),
('pt', 'dashboard.welcome', 'Bem-vindo ao Tektons Table'),
('fr', 'dashboard.welcome', 'Bienvenue sur Tektons Table'),
('ko', 'dashboard.welcome', 'Tektons Table에 오신 것을 환영합니다'),
('zh', 'dashboard.welcome', '欢迎来到Tektons Table');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(translation_key);
CREATE INDEX IF NOT EXISTS idx_currency_settings_tenant ON currency_settings(tenant_id);
