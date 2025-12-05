-- Phase 5: Supporter Management
-- Add supporter profiles and authentication

-- Create supporter profiles table
CREATE TABLE IF NOT EXISTS public.supporter_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    preferred_language TEXT DEFAULT 'en',
    total_donated DECIMAL(10,2) DEFAULT 0,
    last_donation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_supporter_profiles_tenant ON public.supporter_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supporter_profiles_email ON public.supporter_profiles(email);

-- Enable RLS
ALTER TABLE public.supporter_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supporter_profiles
DROP POLICY IF EXISTS "supporters_select_own" ON public.supporter_profiles;
CREATE POLICY "supporters_select_own" ON public.supporter_profiles
    FOR SELECT USING (id = auth.uid());

-- Fixed UPDATE policy syntax to include WITH CHECK clause
DROP POLICY IF EXISTS "supporters_update_own" ON public.supporter_profiles;
CREATE POLICY "supporters_update_own" ON public.supporter_profiles
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "tenants_view_supporters" ON public.supporter_profiles;
CREATE POLICY "tenants_view_supporters" ON public.supporter_profiles
    FOR SELECT USING (tenant_id = auth.uid());

-- Add supporter notes table for CRM
CREATE TABLE IF NOT EXISTS public.supporter_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    supporter_id UUID NOT NULL REFERENCES public.supporter_profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_supporter_notes_supporter ON public.supporter_notes(supporter_id);
CREATE INDEX IF NOT EXISTS idx_supporter_notes_tenant ON public.supporter_notes(tenant_id);

-- Enable RLS
ALTER TABLE public.supporter_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supporter_notes
DROP POLICY IF EXISTS "tenants_manage_notes" ON public.supporter_notes;
CREATE POLICY "tenants_manage_notes" ON public.supporter_notes
    FOR ALL USING (tenant_id = auth.uid());

-- Function to update supporter total donated
CREATE OR REPLACE FUNCTION update_supporter_total_donated()
RETURNS TRIGGER AS $$
BEGIN
    -- Update supporter profile with total donations and last donation date
    UPDATE public.supporter_profiles
    SET 
        total_donated = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.donations
            WHERE supporter_email = NEW.supporter_email
              AND tenant_id = NEW.tenant_id
              AND status = 'succeeded'
        ),
        last_donation_date = NEW.created_at,
        updated_at = NOW()
    WHERE tenant_id = NEW.tenant_id
      AND email = NEW.supporter_email;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_supporter_total ON public.donations;
CREATE TRIGGER trigger_update_supporter_total
    AFTER INSERT OR UPDATE ON public.donations
    FOR EACH ROW
    WHEN (NEW.status = 'succeeded')
    EXECUTE FUNCTION update_supporter_total_donated();
