-- Compare the two tenant logins to ensure they match

-- 1. Compare tenant records
SELECT 
  'TENANT COMPARISON' as section,
  subdomain,
  email,
  is_active,
  stripe_account_id IS NOT NULL as has_stripe,
  created_at
FROM tenants
WHERE subdomain IN ('wesshinn', 'savefeedrestore')
ORDER BY subdomain;

-- 2. Compare auth.users records for these tenants
SELECT 
  'AUTH USERS COMPARISON' as section,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.last_sign_in_at,
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE u.email IN (
  SELECT email FROM tenants WHERE subdomain IN ('wesshinn', 'savefeedrestore')
)
ORDER BY u.email;

-- 3. Check for case sensitivity issues
SELECT 
  'CASE CHECK' as section,
  t.subdomain,
  t.email as tenant_email,
  u.email as auth_email,
  LOWER(t.email) = LOWER(u.email) as emails_match_case_insensitive,
  t.email = u.email as emails_match_exact
FROM tenants t
LEFT JOIN auth.users u ON LOWER(t.email) = LOWER(u.email)
WHERE t.subdomain IN ('wesshinn', 'savefeedrestore');

-- 4. Check active sessions for both users
SELECT 
  'SESSIONS' as section,
  u.email,
  COUNT(*) as session_count,
  MAX(s.created_at) as most_recent_session,
  MAX(s.refreshed_at) as last_refreshed
FROM auth.sessions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email IN (
  SELECT email FROM tenants WHERE subdomain IN ('wesshinn', 'savefeedrestore')
)
GROUP BY u.email;

-- 5. Check identities
SELECT 
  'IDENTITIES' as section,
  u.email,
  i.provider,
  i.created_at,
  i.updated_at,
  i.last_sign_in_at
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email IN (
  SELECT email FROM tenants WHERE subdomain IN ('wesshinn', 'savefeedrestore')
)
ORDER BY u.email;
