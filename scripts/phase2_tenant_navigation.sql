-- Phase 2: Tenant Navigation Menu System

-- Create table for custom tenant navigation menu items
CREATE TABLE IF NOT EXISTS tenant_navigation_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false, -- false for default items, true for custom items
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_navigation_tenant ON tenant_navigation_menu(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_navigation_position ON tenant_navigation_menu(tenant_id, position);

-- Add RLS policies
ALTER TABLE tenant_navigation_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenant navigation"
  ON tenant_navigation_menu FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Tenant owners can manage their navigation"
  ON tenant_navigation_menu FOR ALL
  USING (
    tenant_id = auth.uid()
  );

-- Function to initialize default navigation for new tenants
CREATE OR REPLACE FUNCTION initialize_tenant_navigation()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default navigation items
  INSERT INTO tenant_navigation_menu (tenant_id, label, href, icon, position, is_custom)
  VALUES
    (NEW.id, 'Home', '/' || NEW.subdomain, '🏠', 0, false),
    (NEW.id, 'About', '/' || NEW.subdomain || '/about', 'ℹ️', 1, false),
    (NEW.id, 'Support', '/' || NEW.subdomain || '/giving', '💝', 2, false),
    (NEW.id, 'Contact', '/' || NEW.subdomain || '/contact', '✉️', 3, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize navigation when tenant is created
DROP TRIGGER IF EXISTS on_tenant_created_init_navigation ON tenants;
CREATE TRIGGER on_tenant_created_init_navigation
  AFTER INSERT ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION initialize_tenant_navigation();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenant_navigation_updated_at ON tenant_navigation_menu;
CREATE TRIGGER update_tenant_navigation_updated_at
  BEFORE UPDATE ON tenant_navigation_menu
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
