# Super Admin Setup Guide

## Initial Setup

To access the admin dashboard, you need to be added to the `super_admins` table.

### Step 1: Sign up as a regular user

1. Go to `/auth/signup` and create an account
2. Verify your email

### Step 2: Add yourself as a super admin

Run this SQL in your Supabase SQL Editor:

```sql
-- Find your user ID
SELECT id, email FROM auth.users;

-- Add yourself as super admin (replace with your actual user_id and email)
INSERT INTO super_admins (user_id, email, full_name)
VALUES (
  'your-user-id-here',
  'your-email@example.com',
  'Your Full Name'
);
```

### Step 3: Access the admin dashboard

Once added, you can access:

- **Main Dashboard**: `/admin` - Platform overview and analytics
- **Tenant Management**: `/admin/tenants` - View and manage all tenants
- **Platform Settings**: `/admin/settings` - Adjust platform fees, toggle referral program
- **Backup Management**: `/admin/backups` - View and manage automated backups
- **Help Content**: `/admin/help` - Manage help articles and documentation

## Admin Features

### Platform Analytics
- Total and active tenant counts
- Total donations and platform revenue
- Breakdown by fees, tips, and fee coverage

### Tenant Management
- View all tenants
- Suspend/activate accounts
- Delete tenants
- View tenant details and metrics

### Platform Settings
- Adjust base platform fee percentage (default: 3.5%)
- Toggle referral program on/off
- View fee adjustment history

### Backup System
- Automated nightly backups at 5:00 AM UTC
- Manual backup triggers
- Download backup files
- Email notifications to all super admins

## Security

Super admins have full access to:
- All tenant data
- Platform settings
- User management
- Financial analytics
- System backups

Only trusted administrators should be added to the `super_admins` table.
