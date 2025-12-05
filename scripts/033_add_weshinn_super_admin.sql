-- Add weshinn@gmail.com as super admin
-- User ID: a382013e-f39a-4eda-9f82-fb7aa6d26b53

-- Check if user exists in super_admins
DO $$
BEGIN
  -- Insert into super_admins if not exists
  IF NOT EXISTS (
    SELECT 1 FROM super_admins 
    WHERE user_id = 'a382013e-f39a-4eda-9f82-fb7aa6d26b53'
  ) THEN
    -- Added email and full_name to satisfy NOT NULL constraints
    INSERT INTO super_admins (user_id, email, full_name)
    VALUES (
      'a382013e-f39a-4eda-9f82-fb7aa6d26b53',
      'weshinn@gmail.com',
      'Wes Hinn'
    );
    
    RAISE NOTICE 'Super admin added: weshinn@gmail.com';
  ELSE
    RAISE NOTICE 'User already exists as super admin';
  END IF;
END $$;
