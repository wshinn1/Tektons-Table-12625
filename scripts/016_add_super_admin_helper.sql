-- Helper script to add a super admin
-- Replace the values below with your actual user information

-- Step 1: Find your user ID (uncomment and run this first)
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 2: Add yourself as super admin (replace the values and uncomment)
-- INSERT INTO super_admins (user_id, email, full_name)
-- VALUES (
--   'YOUR_USER_ID_HERE',  -- Get this from the query above
--   'your-email@example.com',  -- Your email address
--   'Your Full Name'  -- Your name
-- );

-- Step 3: Verify you were added (uncomment and run)
-- SELECT * FROM super_admins;

-- Example (DO NOT USE THESE VALUES):
-- INSERT INTO super_admins (user_id, email, full_name)
-- VALUES (
--   'a1b2c3d4-e5f6-7890-1234-567890abcdef',
--   'admin@tektonstable.com',
--   'Admin User'
-- );
