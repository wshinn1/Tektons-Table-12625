-- Fix search_path security warnings for page builder functions
-- Sets search_path to empty string to prevent search_path injection attacks

-- Fix update_tenant_pages_updated_at function
CREATE OR REPLACE FUNCTION public.update_tenant_pages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_tenant_menu_items_updated_at function
CREATE OR REPLACE FUNCTION public.update_tenant_menu_items_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix seed_tenant_default_menu_items function
CREATE OR REPLACE FUNCTION public.seed_tenant_default_menu_items(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.tenant_menu_items (tenant_id, label, url, icon, sort_order, is_visible, is_system)
  VALUES
    (p_tenant_id, 'Home', '/', 'Home', 0, true, true),
    (p_tenant_id, 'About', '/about', 'User', 1, true, true),
    (p_tenant_id, 'Support', '/give', 'Heart', 2, true, true),
    (p_tenant_id, 'Subscribe', '/subscribe', 'Mail', 3, true, true),
    (p_tenant_id, 'Contact', '/contact', 'MessageCircle', 4, true, true)
  ON CONFLICT DO NOTHING;
END;
$$;
