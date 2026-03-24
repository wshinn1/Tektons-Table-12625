-- Compare the two tenants to understand why login works for one but not the other

-- 1. Get both tenant records by subdomain
SELECT 
  id,
  subdomain,
  email,
  full_name,
  is_active,
  onboarding_completed,
  stripe_account_status,
  created_at,
  updated_at
FROM tenants 
WHERE subdomain IN ('wesshinn', 'savefeedrestore');

-- 2. Check if users exist in auth.users for both email addresses
-- Note: We need to look up by email from the tenants table
-- For wesshinn tenant (owner email)
SELECT 
  t.subdomain,
  t.email as tenant_email,
  au.id as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at,
  au.created_at as auth_created_at,
  au.last_sign_in_at,
  au.is_sso_user,
  au.deleted_at
FROM tenants t
LEFT JOIN auth.users au ON LOWER(au.email) = LOWER(t.email)
WHERE t.subdomain IN ('wesshinn', 'savefeedrestore');

-- 3. Check if there are any matching auth users by tenant ID
-- (in case there's a user_id field or something linking them)
SELECT 
  t.subdomain,
  t.id as tenant_id,
  t.email as tenant_email,
  au.id as auth_user_id,
  au.email as auth_email,
  au.raw_user_meta_data
FROM tenants t
LEFT JOIN auth.users au ON au.raw_user_meta_data->>'tenant_id' = t.id::text
WHERE t.subdomain IN ('wesshinn', 'savefeedrestore');

-- 4. Just list all auth users to see what emails are registered
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 50;
