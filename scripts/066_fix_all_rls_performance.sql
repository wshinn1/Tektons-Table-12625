-- Fix ALL RLS performance warnings by wrapping auth.uid() in (select auth.uid())
-- This script dynamically finds and fixes all policies

-- Create a function to fix all RLS policies
CREATE OR REPLACE FUNCTION fix_all_rls_policies()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    policy_record RECORD;
    new_qual TEXT;
    new_with_check TEXT;
    drop_sql TEXT;
    create_sql TEXT;
    cmd_type TEXT;
BEGIN
    -- Loop through all policies that contain auth.uid() without the select wrapper
    FOR policy_record IN
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        AND (
            qual::text LIKE '%auth.uid()%' 
            OR with_check::text LIKE '%auth.uid()%'
            OR qual::text LIKE '%auth.role()%'
            OR with_check::text LIKE '%auth.role()%'
            OR qual::text LIKE '%auth.jwt()%'
            OR with_check::text LIKE '%auth.jwt()%'
            OR qual::text LIKE '%auth.email()%'
            OR with_check::text LIKE '%auth.email()%'
        )
        AND NOT (
            qual::text LIKE '%(select auth.uid())%'
            OR qual::text LIKE '%( select auth.uid())%'
            OR qual::text LIKE '%(SELECT auth.uid())%'
        )
    LOOP
        -- Replace auth functions with select-wrapped versions
        new_qual := policy_record.qual;
        new_with_check := policy_record.with_check;
        
        IF new_qual IS NOT NULL THEN
            new_qual := regexp_replace(new_qual, 'auth\.uid$$$$', '(select auth.uid())', 'gi');
            new_qual := regexp_replace(new_qual, 'auth\.role$$$$', '(select auth.role())', 'gi');
            new_qual := regexp_replace(new_qual, 'auth\.jwt$$$$', '(select auth.jwt())', 'gi');
            new_qual := regexp_replace(new_qual, 'auth\.email$$$$', '(select auth.email())', 'gi');
        END IF;
        
        IF new_with_check IS NOT NULL THEN
            new_with_check := regexp_replace(new_with_check, 'auth\.uid$$$$', '(select auth.uid())', 'gi');
            new_with_check := regexp_replace(new_with_check, 'auth\.role$$$$', '(select auth.role())', 'gi');
            new_with_check := regexp_replace(new_with_check, 'auth\.jwt$$$$', '(select auth.jwt())', 'gi');
            new_with_check := regexp_replace(new_with_check, 'auth\.email$$$$', '(select auth.email())', 'gi');
        END IF;
        
        -- Drop existing policy
        drop_sql := format('DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
        
        EXECUTE drop_sql;
        
        -- Determine command type
        cmd_type := CASE policy_record.cmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            ELSE 'ALL'
        END;
        
        -- Build create policy SQL
        create_sql := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename,
            CASE WHEN policy_record.permissive = 'PERMISSIVE' THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
            cmd_type,
            array_to_string(policy_record.roles, ', ')
        );
        
        IF new_qual IS NOT NULL THEN
            create_sql := create_sql || ' USING (' || new_qual || ')';
        END IF;
        
        IF new_with_check IS NOT NULL THEN
            create_sql := create_sql || ' WITH CHECK (' || new_with_check || ')';
        END IF;
        
        BEGIN
            EXECUTE create_sql;
            RAISE NOTICE 'Fixed policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error fixing policy % on %.%: %', policy_record.policyname, policy_record.schemaname, policy_record.tablename, SQLERRM;
        END;
    END LOOP;
END;
$$;

-- Run the fix function
SELECT fix_all_rls_policies();

-- Clean up the function
DROP FUNCTION fix_all_rls_policies();
