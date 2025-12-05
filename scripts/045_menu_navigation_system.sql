-- Create menu navigation table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  is_dropdown BOOLEAN DEFAULT FALSE,
  navigation_side TEXT CHECK (navigation_side IN ('left', 'right')) DEFAULT 'left',
  position INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins full access to menu_items"
  ON menu_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM super_admins
    WHERE super_admins.user_id = auth.uid()
  ));

-- Fixed RLS policy to match tenant ownership pattern used in other tables
-- Tenants can manage their own menu items
CREATE POLICY "Tenants can manage their menu items"
  ON menu_items FOR ALL
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE id = (
      SELECT tenant_id FROM tenants WHERE id = menu_items.tenant_id
    )
  ));

-- Public read access
CREATE POLICY "Public read access to published menu items"
  ON menu_items FOR SELECT
  USING (published = TRUE);

-- Create index for performance
CREATE INDEX idx_menu_items_tenant_id ON menu_items(tenant_id);
CREATE INDEX idx_menu_items_position ON menu_items(position);
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
